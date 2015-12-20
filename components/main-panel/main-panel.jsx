import React from 'react';
import ReactDOM from 'react-dom';


class MainPanel extends React.Component {
  render () {
    return (
      <section id="mainPanel">
        <div id="panelContent">

          <Map />

          <div id="locationsTabContent" className="hidden"></div>
          <div id="birdSpeciesTabContent" className="hidden">
            <div id="birdSpeciesTable"></div>
          </div>
        </div>

        <IntroOverlay visible={true} />
      </section>
    );
  }
}

class IntroOverlay extends React.Component {
  render () {
    return (
      <div>
        <div id="map-overlay"></div>
        <div id="initSearchControls">
          <div className="tab-content">
            <div>
              <button className="btn btn-success" id="searchNearby">
                <i className="glyphicon glyphicon-home"></i>
                Search <b>Nearby</b>
              </button>
              Find bird sightings in your area.
            </div>

            <p className="or">OR</p>

            <div>
              <button className="btn btn-info" id="searchAnywhere">
                <i className="glyphicon glyphicon-globe"></i>
                Search <b>Anywhere</b>
              </button>
              Find bird sightings anywhere.
            </div>
          </div>
        </div>
      </div>
    );
  }
}



class Map extends React.Component {
  componentDidMount () {

    google.maps.visualRefresh = true;

    // move to props?
    var defaultMapOptions = {
      zoom: 3,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControlOptions: { mapTypeIds: [] },
      center: new google.maps.LatLng(30, 0),
      streetViewControl: false,
      disableDefaultUI: true,
      panControl: true,
      zoomControl: true,
      scaleControl: true,
      overviewMapControl: true
    };

    var mapCanvas = ReactDOM.findDOMNode(this);
    var map       = new google.maps.Map(mapCanvas, defaultMapOptions);
  }

  render () {
    //_addCustomControls();
    //_addEventHandlers();
    //
    //// called any time the map has had its bounds changed
    //google.maps.event.addListener(_map, "dragend", _onMapBoundsChange);
    //google.maps.event.addListener(_map, "zoom_changed", _onMapBoundsChange);
    //
    //mediator.publish(_MODULE_ID, C.EVENT.TRIGGER_WINDOW_RESIZE);

    return (
      <div></div>
    );
  }
}

export default MainPanel;

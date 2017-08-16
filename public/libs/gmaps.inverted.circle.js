/* 
 * https://github.com/raihan2006i/google-map-inverted-circle
 * Copyright (c) 2013 Miah Raihan Mahmud Arman
 * Released under the MIT licence: http://opensource.org/licenses/mit-license
 * Note: The Google Maps API v3 must be included *before* this code
 */

function InvertedCircle(opts) {
  var options = {
    visible: true,
    map: opts.map,
    center: opts.map.getCenter(),
    radius: 200000, // 200 km
    draggable: false,
    editable: false,
    stroke_weight: 1,
    fill_opacity: 0.3,
    fill_color: "#000",
    always_fit_to_map: false
  }
  options = this.extend_(options, opts);

  this.set('visible', options.visible);
  this.set('map', options.map);
  this.set('center', options.center);
  this.set('radius', options.radius);
  this.set('old_radius', options.radius);
  this.set('draggable', options.draggable);
  this.set('editable', options.editable);
  this.set('stroke_weight', options.stroke_weight);
  this.set('fill_opacity', options.fill_opacity);
  this.set('fill_color', options.fill_color);
  this.set('always_fit_to_map', options.always_fit_to_map);
  this.set('position', options.center);
  this.set('resize_leftright', options.resize_leftright);
  this.set('resize_updown', options.resize_updown);

  // TODO: We should be able to set custom center marker image icon
  var center_marker = new google.maps.Marker({
    visible: false
  });

  // Bind the marker map property to the InvertedCircle map property
  center_marker.bindTo('map', this);
  center_marker.bindTo('draggable', this);

  // Bind the marker position property to the InvertedCircle position property
  center_marker.bindTo('position', this);
  this.set('center_marker', center_marker);

  // Draw the inverse circle
  this.drawCircle_(this.get('map'), this.get('position'), this.get('radius') / 1000);

  // Add the sizer marker
  this.addSizer_();
//this.addVisibleController_();
}

InvertedCircle.prototype = new google.maps.MVCObject();

InvertedCircle.prototype.position_changed = function()
{
  this.set('center', this.get('position'));
  if(this.get('donut')){
    var paths = new this.Overlay;
    var spot = this.drawSpot_(this.getCenter(), this.getRadius() / 1000);
    for (var i = 0; i < spot.length; i++) {
      paths.push(spot[i]);
    }
    this.set('paths', paths);
    if(this.getVisible())
      this.get('donut').setPaths(paths);
  }
  if(this.get('sizer_left') && this.get('sizer_right') && this.get('sizer_up') && this.get('sizer_down')){
    var left_endpoint = google.maps.geometry.spherical.computeOffset(this.getCenter(), this.getRadius(), -90);
    var right_endpoint = google.maps.geometry.spherical.computeOffset(this.getCenter(), this.getRadius(), 90);
    var up_endpoint = google.maps.geometry.spherical.computeOffset(this.getCenter(), this.getRadius(), 360);
    var down_endpoint = google.maps.geometry.spherical.computeOffset(this.getCenter(), this.getRadius(), 180);
    this.get('sizer_left').setPosition(left_endpoint);
    this.get('sizer_right').setPosition(right_endpoint);
    this.get('sizer_up').setPosition(up_endpoint);
    this.get('sizer_down').setPosition(down_endpoint);

  }
};

InvertedCircle.prototype.radius_changed = function()
{
  if(this.get('donut')){
    var paths = new this.Overlay;
    var spot = this.drawSpot_(this.getCenter(), this.getRadius() / 1000);
    for (var i = 0; i < spot.length; i++) {
      paths.push(spot[i]);
    }
    this.set('paths', paths);
    if(this.getVisible())
      this.get('donut').setPaths(paths);
  }
  if(this.get('sizer_left') && this.get('sizer_right') && this.get('sizer_up') && this.get('sizer_down')){
    var left_endpoint = google.maps.geometry.spherical.computeOffset(this.getCenter(), this.getRadius(), -90);
    var right_endpoint = google.maps.geometry.spherical.computeOffset(this.getCenter(), this.getRadius(), 90);
    var up_endpoint = google.maps.geometry.spherical.computeOffset(this.getCenter(), this.getRadius(), 360);
    var down_endpoint = google.maps.geometry.spherical.computeOffset(this.getCenter(), this.getRadius(), 180);
    this.get('sizer_left').setPosition(left_endpoint);
    this.get('sizer_right').setPosition(right_endpoint);
    this.get('sizer_up').setPosition(up_endpoint);
    this.get('sizer_down').setPosition(down_endpoint);
  }
};

InvertedCircle.prototype.visible_changed = function()
{
  this.setEditable(this.getVisible());
  this.setDraggable(this.getVisible());
  if(this.getVisible()){
    if(this.get('donut'))
      this.get('donut').setPaths(this.get('paths'));
  }else{
    if(this.get('donut'))
      this.get('donut').setPaths([]);
  }
}

InvertedCircle.prototype.setMap = function(map)
{
  this.set('map', map);
}

InvertedCircle.prototype.getMap = function()
{
  return this.get('map');
}

InvertedCircle.prototype.setVisible = function(visible)
{
  this.set('visible', visible);
  /*if(this.get('visible')){
   this.get('circleControlDiv').innerHTML = '<div style="direction: ltr; overflow: hidden; text-align: left; position: relative; color: rgb(0, 0, 0); font-family: Arial, sans-serif; -webkit-user-select: none; font-size: 13px; background-color: rgb(255, 255, 255); padding: 4px; border-width: 1px 1px 1px 0px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-top-color: rgb(113, 123, 135); border-right-color: rgb(113, 123, 135); border-bottom-color: rgb(113, 123, 135); -webkit-box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px; box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px; font-weight: bold; background-position: initial initial; background-repeat: initial initial; " title="Turn On/Off the Circle"><span><div style="width: 16px; height: 16px; overflow: hidden; position: relative; "><img style="position: absolute; left: 0px; top: 0px; -webkit-user-select: none; border: 0px; padding: 0px; margin: 0px; width: auto; height: auto; " src="http://maps.gstatic.com/mapfiles/drawing.png" draggable="false"></div></span></div>';
   }else{
   this.get('circleControlDiv').innerHTML = '<div style="direction: ltr; overflow: hidden; text-align: left; position: relative; color: rgb(51, 51, 51); font-family: Arial, sans-serif; -webkit-user-select: none; font-size: 13px; background-color: rgb(255, 255, 255); padding: 4px; border-width: 1px 1px 1px 0px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-top-color: rgb(113, 123, 135); border-right-color: rgb(113, 123, 135); border-bottom-color: rgb(113, 123, 135); -webkit-box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px; box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px; font-weight: normal; background-position: initial initial; background-repeat: initial initial; " title="Turn On/Off the Circle"><span><div style="width: 16px; height: 16px; overflow: hidden; position: relative; "><img style="position: absolute; left: 0px; top: -160px; -webkit-user-select: none; border: 0px; padding: 0px; margin: 0px; width: auto; height: auto; " src="http://maps.gstatic.com/mapfiles/drawing.png" draggable="false"></div></span></div>';
   }*/
};

InvertedCircle.prototype.getVisible = function()
{
  return this.get('visible');
};

InvertedCircle.prototype.setCenter = function(center)
{
  this.set('position', center);
};

InvertedCircle.prototype.getCenter = function()
{
  return this.get('position');
};

InvertedCircle.prototype.getRadius = function()
{
  return this.get('radius');
};

InvertedCircle.prototype.setRadius = function(radius)
{
  this.set('radius', radius);
};

InvertedCircle.prototype.getOldRadius = function()
{
  return this.get('old_radius');
};

InvertedCircle.prototype.setOldRadius = function(radius)
{
  this.set('old_radius', radius);
};


InvertedCircle.prototype.getEditable = function()
{
  return this.get('editable');
};

InvertedCircle.prototype.setEditable = function(editable)
{
  this.set('editable', editable);
};

InvertedCircle.prototype.getDraggable = function()
{
  return this.get('draggable');
};

InvertedCircle.prototype.setDraggable = function(draggable)
{
  this.set('draggable', draggable);
};

InvertedCircle.prototype.getBounds = function()
{
  var old_radius = this.getOldRadius();
  var radius = this.getRadius();
  //console.log(old_radius);
  //console.log(radius);
  var bound_radius, center, bounds, left_bound, right_bound, up_bound, down_bound;
  center = this.getCenter();
  bounds = new google.maps.LatLngBounds();
  if(old_radius < radius){
    //console.log('old_radius < radius');
    bound_radius = radius * 1.1;
    if(bound_radius > (6371 * 1000)){
      bound_radius = 6371 * 1000;
    }
    //console.log('bound_radius = ' + bound_radius);
    left_bound = google.maps.geometry.spherical.computeOffset(center, bound_radius, -90);
    right_bound = google.maps.geometry.spherical.computeOffset(center, bound_radius, 90);
    up_bound = google.maps.geometry.spherical.computeOffset(center, bound_radius, 360);
    down_bound = google.maps.geometry.spherical.computeOffset(center, bound_radius, 180);
  }
  if(old_radius > radius){
    //console.log('old_radius > radius');
    bound_radius = radius / 2.5;
    if(bound_radius < 0){
      bound_radius = 0;
    }
    //console.log('bound_radius = ' + bound_radius);
    left_bound = google.maps.geometry.spherical.computeOffset(center, bound_radius, -90);
    right_bound = google.maps.geometry.spherical.computeOffset(center, bound_radius, 90);
    up_bound = google.maps.geometry.spherical.computeOffset(center, bound_radius, 360);
    down_bound = google.maps.geometry.spherical.computeOffset(center, bound_radius, 180);
  }

  if(old_radius == radius){
    console.log('old_radius == radius');
    // bound_radius = radius;
    left_bound = google.maps.geometry.spherical.computeOffset(center, bound_radius, -90);
    right_bound = google.maps.geometry.spherical.computeOffset(center, bound_radius, 90);
    up_bound = google.maps.geometry.spherical.computeOffset(center, bound_radius, 360);
    down_bound = google.maps.geometry.spherical.computeOffset(center, bound_radius, 180);
  }

  /*console.log(left_bound);
   console.log(right_bound);
   console.log(up_bound);
   console.log(down_bound);*/

  bounds.extend(left_bound);
  bounds.extend(right_bound);
  bounds.extend(up_bound);
  bounds.extend(down_bound);

  /*var bounds = new google.maps.LatLngBounds();
   bounds.extend(this.get('sizer_left').getPosition());
   bounds.extend(this.get('sizer_right').getPosition());
   bounds.extend(this.get('sizer_up').getPosition());
   bounds.extend(this.get('sizer_down').getPosition());*/
  return bounds;
};

/**
 * Add the sizer markers to the map.
 *
 * @private
 */
InvertedCircle.prototype.addSizer_ = function() {
  var sizer_icon_left_right = new google.maps.MarkerImage(this.get('resize_leftright'),
    // second line defines the dimensions of the image
    new google.maps.Size(29, 29),
    // third line defines the origin of the custom icon
    new google.maps.Point(0,0),
    // and the last line defines the offset for the image
    new google.maps.Point(15, 15)
  );

  var sizer_icon_up_down = new google.maps.MarkerImage(this.get('resize_updown'),
    // second line defines the dimensions of the image
    new google.maps.Size(29, 29),
    // third line defines the origin of the custom icon
    new google.maps.Point(0,0),
    // and the last line defines the offset for the image
    new google.maps.Point(15, 15)
  );


  var left_endpoint = google.maps.geometry.spherical.computeOffset(this.getCenter(), this.getRadius(), -90);
  var sizer_left = new google.maps.Marker({
    position: left_endpoint,
    title: 'Drag me!',
    raiseOnDrag: false
  //  icon: sizer_icon_left_right
  });


  var right_endpoint = google.maps.geometry.spherical.computeOffset(this.getCenter(), this.getRadius(), 90);
  var sizer_right = new google.maps.Marker({
    position: right_endpoint,
    title: 'Drag me!',
    raiseOnDrag: false
    //icon: sizer_icon_left_right
  });

  var up_endpoint = google.maps.geometry.spherical.computeOffset(this.getCenter(), this.getRadius(), 360);
  var sizer_up = new google.maps.Marker({
    position: up_endpoint,
    title: 'Drag me!',
    raiseOnDrag: false,
    //icon: sizer_icon_up_down,
    visible: false
  });

  var down_endpoint = google.maps.geometry.spherical.computeOffset(this.getCenter(), this.getRadius(), 180);
  var sizer_down = new google.maps.Marker({
    position: down_endpoint,
    title: 'Drag me!',
    raiseOnDrag: false,
    //icon: sizer_icon_up_down,
    visible: false
  });

  sizer_left.bindTo('map', this, 'map');
  sizer_left.bindTo('visible', this, 'editable');
  sizer_left.bindTo('draggable', this, 'editable');
  sizer_right.bindTo('map', this, 'map');
  sizer_right.bindTo('visible', this, 'editable');
  sizer_right.bindTo('draggable', this, 'editable');
  sizer_up.bindTo('map', this, 'map');
  sizer_up.bindTo('draggable', this, 'editable');
  sizer_down.bindTo('map', this, 'map');
  sizer_down.bindTo('draggable', this, 'editable');

  this.set('sizer_left', sizer_left);
  this.set('sizer_right', sizer_right);
  this.set('sizer_up', sizer_up);
  this.set('sizer_down', sizer_down);

  var me = this;

  google.maps.event.addListener(sizer_left, 'dragstart', function() {
    me.setOldRadius(me.getRadius());
  });

  google.maps.event.addListener(sizer_left, 'mouseover', function() {
    var icon = me.get('sizer_left').getIcon();
    icon.origin = new google.maps.Point(0,29);
    me.get('sizer_left').setIcon(icon);
  });

  google.maps.event.addListener(sizer_left, 'mouseout', function() {
    var icon = me.get('sizer_left').getIcon();
    icon.origin = new google.maps.Point(0,0);
    me.get('sizer_left').setIcon(icon);
  });

  google.maps.event.addListener(sizer_right, 'dragstart', function() {
    me.setOldRadius(me.getRadius());
  });

  google.maps.event.addListener(sizer_right, 'mouseover', function() {
    var icon = me.get('sizer_right').getIcon();
    icon.origin = new google.maps.Point(0,29);
    me.get('sizer_right').setIcon(icon);
  });

  google.maps.event.addListener(sizer_right, 'mouseout', function() {
    var icon = me.get('sizer_right').getIcon();
    icon.origin = new google.maps.Point(0,0);
    me.get('sizer_right').setIcon(icon);
  });

  google.maps.event.addListener(sizer_left, 'drag', function() {
    radius = google.maps.geometry.spherical.computeDistanceBetween(me.getCenter(), me.get('sizer_left').getPosition());
    me.setRadius(radius);
  });

  google.maps.event.addListener(sizer_right, 'drag', function() {
    radius = google.maps.geometry.spherical.computeDistanceBetween(me.getCenter(), me.get('sizer_right').getPosition());
    me.setRadius(radius);
  });

  google.maps.event.addListener(sizer_left, 'dragend', function() {
    radius = google.maps.geometry.spherical.computeDistanceBetween(me.getCenter(), me.get('sizer_right').getPosition());
    me.setRadius(radius);
    /*var old_radius = me.getOldRadius();
     var radius = me.getRadius();
     console.log("Old " + old_radius);
     console.log("Current " + radius);*/
    if(me.get('always_fit_to_map')){
      me.get('map').fitBounds(me.getBounds());
    }
  });

  google.maps.event.addListener(sizer_right, 'dragend', function() {
    radius = google.maps.geometry.spherical.computeDistanceBetween(me.getCenter(), me.get('sizer_right').getPosition());
    me.setRadius(radius);
    /*var old_radius = me.getOldRadius();
     var radius = me.getRadius();
     console.log("Old " + old_radius);
     console.log("Current " + radius);*/
    if(me.get('always_fit_to_map')){
      me.get('map').fitBounds(me.getBounds());
    }
  });
};

/**
 * This is to draw Circle Visible Control button
 *
 * @private
 */
InvertedCircle.prototype.addVisibleController_ = function() {
  // Create the DIV to hold the control and call the HomeControl() constructor
  // passing in this DIV.
  this.set('circleControlDiv', document.createElement('div'));
  // Set CSS styles for the DIV containing the control
  // Setting padding to 5 px will offset the control
  // from the edge of the map.
  this.get('circleControlDiv').style.padding = '9px';
  this.get('circleControlDiv').style.cursor = 'pointer';
  this.get('circleControlDiv').innerHTML = '<div style="direction: ltr; overflow: hidden; text-align: left; position: relative; color: rgb(0, 0, 0); font-family: Arial, sans-serif; -webkit-user-select: none; font-size: 13px; background-color: rgb(255, 255, 255); padding: 4px; border-width: 1px 1px 1px 0px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-top-color: rgb(113, 123, 135); border-right-color: rgb(113, 123, 135); border-bottom-color: rgb(113, 123, 135); -webkit-box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px; box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px; font-weight: bold; background-position: initial initial; background-repeat: initial initial; " title="Turn On/Off the Circle"><span><div style="width: 16px; height: 16px; overflow: hidden; position: relative; "><img style="position: absolute; left: 0px; top: 0px; -webkit-user-select: none; border: 0px; padding: 0px; margin: 0px; width: auto; height: auto; " src="http://maps.gstatic.com/mapfiles/drawing.png" draggable="false"></div></span></div>';
  this.get('circleControlDiv').clicked = options.visible;
  var $me = this;
  // Setup the click event listeners: simply set the map to Chicago.
  google.maps.event.addDomListener(this.get('circleControlDiv'), 'click', function() {
    this.clicked = !this.clicked;
    //console.log(this.clicked);
    if(this.clicked){
      this.innerHTML = '<div style="direction: ltr; overflow: hidden; text-align: left; position: relative; color: rgb(0, 0, 0); font-family: Arial, sans-serif; -webkit-user-select: none; font-size: 13px; background-color: rgb(255, 255, 255); padding: 4px; border-width: 1px 1px 1px 0px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-top-color: rgb(113, 123, 135); border-right-color: rgb(113, 123, 135); border-bottom-color: rgb(113, 123, 135); -webkit-box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px; box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px; font-weight: bold; background-position: initial initial; background-repeat: initial initial; " title="Turn On/Off the Circle"><span><div style="width: 16px; height: 16px; overflow: hidden; position: relative; "><img style="position: absolute; left: 0px; top: 0px; -webkit-user-select: none; border: 0px; padding: 0px; margin: 0px; width: auto; height: auto; " src="http://maps.gstatic.com/mapfiles/drawing.png" draggable="false"></div></span></div>';
      $me.setVisible(true);
    }else{
      this.innerHTML = '<div style="direction: ltr; overflow: hidden; text-align: left; position: relative; color: rgb(51, 51, 51); font-family: Arial, sans-serif; -webkit-user-select: none; font-size: 13px; background-color: rgb(255, 255, 255); padding: 4px; border-width: 1px 1px 1px 0px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-top-color: rgb(113, 123, 135); border-right-color: rgb(113, 123, 135); border-bottom-color: rgb(113, 123, 135); -webkit-box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px; box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px; font-weight: normal; background-position: initial initial; background-repeat: initial initial; " title="Turn On/Off the Circle"><span><div style="width: 16px; height: 16px; overflow: hidden; position: relative; "><img style="position: absolute; left: 0px; top: -160px; -webkit-user-select: none; border: 0px; padding: 0px; margin: 0px; width: auto; height: auto; " src="http://maps.gstatic.com/mapfiles/drawing.png" draggable="false"></div></span></div>';
      $me.setVisible(false);
    }
  });
  this.get('circleControlDiv').index = 1;
  this.get('map').controls[google.maps.ControlPosition.LEFT_TOP].push(this.get('circleControlDiv'));
};

/**
 * This is to extend options
 *
 * @private
 */
InvertedCircle.prototype.extend_ = function(obj, extObj) {
  if (arguments.length > 2) {
    for (var a = 1; a < arguments.length; a++) {
      extend(obj, arguments[a]);
    }
  } else {
    for (var i in extObj) {
      obj[i] = extObj[i];
    }
  }
  return obj;
};

/**
 * This is draw spots
 * Thanks Sammy Hubner (http://www.linkedin.com/in/sammyhubner) for providing me these awesome code
 * @private
 */

InvertedCircle.prototype.drawSpot_ = function(point, radius) {
  var d2r = Math.PI / 180;   // degrees to radians
  var r2d = 180 / Math.PI;   // radians to degrees
  var earthsradius = 6371;   // 6371 is the radius of the earth in kilometers
  var ret = [];
  var isNearPrimaryMeridian = false;
  var dir = 1;
  var extp = [], start, end, i, theta, ex, ey;

  var points = 128;

  // find the radius in lat/lon
  var rlat = (radius / earthsradius) * r2d;
  var rlng = rlat / Math.cos(point.lat() * d2r);

  if (point.lng() > 0) {
    dir = -1;
  }


  if (dir==1) {
    start=0;
    end=points+1;
  } // one extra here makes sure we connect the
  else        {
    start=points+1;
    end=0;
  }
  for (i=start; (dir==1 ? i < end : i > end); i=i+dir)
  {
    theta = Math.PI * (i / (points/2));
    ex = point.lat() + (rlat * Math.sin(theta)); // center b + radius y * sin(theta)
    ey = point.lng() + (rlng * Math.cos(theta)); // center a + radius x * cos(theta)
    if ((dir === -1 && ey < 0) || (dir === 1 && ey > 0)) {
      ey = 0;
      isNearPrimaryMeridian = true;
    }
    extp.push(new google.maps.LatLng(ex, ey));
  }
  ret.push(extp);
  // if near primary meridian we have to draw an inverse
  if (isNearPrimaryMeridian) {
    extp = [];
    dir = -dir;
    if (dir==1) {
      start=0;
      end=points+1
    } // one extra here makes sure we connect the
    else        {
      start=points+1;
      end=0
    }
    for (i=start; (dir==1 ? i < end : i > end); i=i+dir)
    {
      theta = Math.PI * (i / (points/2));
      ex = point.lat() + (rlat * Math.sin(theta)); // center b + radius y * sin(theta)
      ey = point.lng() + (rlng * Math.cos(theta)); // center a + radius x * cos(theta)
      if ((dir === -1 && ey < 0) || (dir === 1 && ey > 0)) {
        ey = 0;
        isNearPrimaryMeridian = true;
      }
      extp.push(new google.maps.LatLng(ex, ey));
    }
    ret.push(extp);
  }
  return ret;
}

/**
 * The Overlay
 * Thanks Sammy Hubner (http://www.linkedin.com/in/sammyhubner) for providing me these awesome code
 *
 */

InvertedCircle.prototype.Overlay = function () {
  var latExtent = 86;
  var lngExtent = 180;
  var lngExtent2 = lngExtent - 1e-10;
  return [
    [
      new google.maps.LatLng(-latExtent, -lngExtent),  // left bottom
      new google.maps.LatLng(latExtent, -lngExtent),   // left top
      new google.maps.LatLng(latExtent, 0),            // right top
      new google.maps.LatLng(-latExtent, 0),           // right bottom
    ], [
      new google.maps.LatLng(-latExtent, lngExtent2),  // right bottom
      new google.maps.LatLng(latExtent, lngExtent2),   // right top
      new google.maps.LatLng(latExtent, 0),            // left top
      new google.maps.LatLng(-latExtent, 0),           // left bottom
    ]
  ];
}

/**
 * This is draw circle
 * Thanks Sammy Hubner (http://www.linkedin.com/in/sammyhubner) for providing me these awesome code
 * @private
 */
InvertedCircle.prototype.drawCircle_ = function(map, center, radius){

  var paths = new this.Overlay;

  var spot = this.drawSpot_(center, radius);
  for (var i = 0; i < spot.length; i++) {
    paths.push(spot[i]);
  }

  var donut = new google.maps.Polygon({
    strokeWeight: this.stroke_weight,
    fillColor: this.fill_color,
    fillOpacity: this.fill_opacity,
    map: map
  });

  this.set('paths', paths);
  this.set('donut', donut);
  if(this.getVisible())
    this.get('donut').setPaths(paths);
}

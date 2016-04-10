var UI = require('ui');
var Vector2 = require('vector2');
var Settings = require('settings');
var innerR = 52;
var outerR = 72;
var centerX = 72;
var centerY = 72;
// var R = 6371000;
var R = 6378137;
var YARD_LENGTH = 0.9144;
var YARDS_IN_MILE = 1760;
// var divider = 100000;
var units = Settings.option('units') || 'metric';
var targetLoc;
var myLat;
var myLon;
var myHeading;
var watcher;
var main = new UI.Window();
var hint = new UI.Card();
var menu = new UI.Menu();

if (Settings.option('locations') && Settings.option('locations').length) {
  buildMenu(Settings.option('locations'));
}
else {
  hint.title('Find Cache');
  hint.body('Use phone to configure!');
  hint.show();
}

var outer = new UI.Circle({ position: new Vector2(centerX, centerY), radius: outerR });
main.add(outer);

var inner = new UI.Circle({ position: new Vector2(centerX, centerY), backgroundColor: 'black', radius: innerR });
main.add(inner);

var north = new UI.Text({
  position: new Vector2(62, -5),
  size: new Vector2(20, 20),
  font: 'gothic-24-bold',
  text: 'N',
  color: 'black',
  textAlign: 'center'
});
main.add(north);

var east = new UI.Text({
  position: new Vector2(122, 57),
  size: new Vector2(20, 20),
  font: 'gothic-24-bold',
  text: 'E',
  color: 'black',
  textAlign: 'center'
});
main.add(east);

var south = new UI.Text({
  position: new Vector2(62, 119),
  size: new Vector2(20, 20),
  font: 'gothic-24-bold',
  text: 'S',
  color: 'black',
  textAlign: 'center'
});
main.add(south);

var west = new UI.Text({
  position: new Vector2(0, 57),
  size: new Vector2(20, 20),
  font: 'gothic-24-bold',
  text: 'W',
  color: 'black',
  textAlign: 'center'
});
main.add(west);

var month = new UI.TimeText({
  position: new Vector2(4, 132),
  size: new Vector2(30, 12),
  font: 'gothic-14',
  text: '%b',
  textAlign: 'left'
});
main.add(month);

var day = new UI.TimeText({
  position: new Vector2(110, 132),
  size: new Vector2(30, 12),
  font: 'gothic-14',
  text: '%d',
  textAlign: 'right'
});
main.add(day);

var me = new UI.Circle({ radius: 8, position: new Vector2(72, 72) });
main.add(me);

var target = new UI.Circle({ backgroundColor: 'black', radius: 8, position: new Vector2(72, 72) });
main.add(target);

var head = new UI.Text({
  position: new Vector2(32, 50),
  size: new Vector2(80, 20),
  font: 'gothic-24-bold',
  text: '',
  color: 'white',
  textAlign: 'center'
});
main.add(head);

var dist = new UI.Text({
  position: new Vector2(32, 70),
  size: new Vector2(80, 20),
  font: 'gothic-24-bold',
  text: '',
  color: 'white',
  textAlign: 'center'
});
main.add(dist);

Settings.config(
  { url: 'https://rawgit.com/samuelmr/pebble-findcache/master/configure.html' },
  function(e) {
    if (e.options && e.options.locations) {
      units = e.options.units;
      buildMenu(e.options.locations);
    }
    if (hint) {
      // hint.hide();
    }
  }
);

menu.on('select', function(e) {
  targetLoc = e.item.subtitle;
  dist.text('');
  head.text('');
  main.show();
  watcher = navigator.geolocation.watchPosition(
    function(position) {
      myHeading = position.coords.heading;
      myLat = position.coords.latitude;
      myLon = position.coords.longitude;
      updateView();
    },
    function(error) {
      head.text('location');
      dist.text('error');
    },
    {enableHighAccuracy: true}
  );
});

function buildMenu(locations) {
  var locs = [];
  for (var i=0; i<locations.length; i++) {
    if (locations[i][0] && locations[i][1]) {
      locs[i] = {title: utf8(locations[i][0]), subtitle: locations[i][1]};
    }
  }
  menu.section(0, {title: 'Locations', items: locs});  
  menu.show();
}

function updateView() {
  if (targetLoc) {
    var loc = targetLoc.split(',');
    var targetLat = parseFloat(loc[0].replace(/[^\d.-]*/g, ''));
    var targetLon = parseFloat(loc[1].replace(/[^\d.-]*/g, ''));
    var dLat = (targetLat-myLat) * Math.PI / 180;
    var dLon = (targetLon-myLon) * Math.PI / 180;
    var l1 = myLat * Math.PI / 180;
    var l2 = targetLat * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(l1) * Math.cos(l2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = Math.round(R * c);
    if (units == 'imperial') {
      d = Math.round(d / YARD_LENGTH);
    }
    var u = (units != 'imperial') ? 'm' : 'yd';
    if (d > 5000) {
      var divider = (units != 'imperial') ? 1000 : YARDS_IN_MILE;
      d = Math.round(100 * d / divider)/100;
      u = (units != 'imperial') ? 'km' : 'mi';
      if (d > 10) {
        d = Math.round(d);
      }
    }
    var newdist = d + ' ' + u;
    var y = Math.sin(dLon) * Math.cos(l2);
    var x = Math.cos(l1)*Math.sin(l2) -
            Math.sin(l1)*Math.cos(l2)*Math.cos(dLon);
    var targetHeading = Math.round(Math.atan2(y, x) * 180 / Math.PI);
    targetHeading = targetHeading < 0 ? 360 + targetHeading : targetHeading;
    var newhead = targetHeading + '°';
    var targetX = centerX + (innerR + (outerR - innerR)/2) * Math.sin((180 - targetHeading) * Math.PI / 180);
    var targetY = centerY + (innerR + (outerR - innerR)/2) * Math.cos((180 - targetHeading) * Math.PI / 180);
    var myX = 72;
    var myY = -20;
    if (myHeading !== null) {
      myX = centerX + (innerR - (outerR - innerR)/2) * Math.sin((180 - myHeading) * Math.PI / 180);
      myY = centerY + (innerR - (outerR - innerR)/2) * Math.cos((180 - myHeading) * Math.PI / 180);
    }
    myHeading = myHeading < 0 ? 360 + myHeading : myHeading;
    if ((newdist != dist.text()) ||
        (newhead != head.text()) ||
        (me.position().x != myX) ||
        (me.position().y != myY) ||
        (target.position().x != targetX) ||
        (target.position().y != targetY))  {
      dist.text(newdist);
      head.text(newhead);
      target.animate('position', new Vector2(targetX, targetY));
      me.animate('position', new Vector2(myX, myY));
    } 
    // console.log('dist is ' + dist.text() + ' and head is ' + head.text() + '; my heading is ' + myHeading);
  }
}

function utf8(str) {
  return unescape(encodeURI(str));
}

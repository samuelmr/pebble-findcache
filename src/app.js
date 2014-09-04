var UI = require('ui');
var Vector2 = require('vector2');
var Settings = require('settings');
var innerR = 52;
var outerR = 72;
var centerX = 72;
var centerY = 72;
var R = 6371000;
var units = 'metric';
var targetLat;
var targetLon;
var myLat;
var myLon;
var myHeading;

Settings.config(
  { url: 'https://rawgit.com/samuelmr/pebble-findcache/master/configure.html' },
  function(e) {
    if (e.options && e.options.lat) {
      targetLat = e.options.lat;
      targetLon = e.options.lon;
      units = e.options.units;
    }
    updateView();
  }
);

var main = new UI.Window();

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

var me = new UI.Circle({ radius: 8, position: new Vector2(72, 72) });
main.add(me);

var target = new UI.Circle({ backgroundColor: 'black', radius: 8, position: new Vector2(72, 72) });
main.add(target);

main.show();

navigator.geolocation.watchPosition(
  function(position) {
    myLat = position.coords.latitude;
    myLon = position.coords.longitude;
    myHeading = position.coords.heading;
    updateView();
  },
  function(error) {
    head.text = 'location';
    dist.text = 'error';
  },
  {enableHighAccuracy: true}
);

function updateView() {
  if (targetLat || targetLon) {
    var dLat = (targetLat-myLat) * Math.PI / 180;
    var dLon = (targetLon-myLon) * Math.PI / 180;
    var l1 = myLat * Math.PI / 180;
    var l2 = targetLat * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(l1) * Math.cos(l2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    dist.text(Math.round(R * c) + ' m');
    var y = Math.sin(dLon) * Math.cos(l2);
    var x = Math.cos(l1)*Math.sin(l2) -
            Math.sin(l1)*Math.cos(l2)*Math.cos(dLon);
    var targetHeading = Math.round(Math.atan2(y, x) * 180 / Math.PI);
    targetHeading = targetHeading < 0 ? 360 + targetHeading : targetHeading;
    head.text(targetHeading + '°');
    var targetX = centerX + (innerR + (outerR - innerR)/2) * Math.sin((180 - targetHeading) * Math.PI / 180);
    var targetY = centerY + (innerR + (outerR - innerR)/2) * Math.cos((180 - targetHeading) * Math.PI / 180);
    target.animate('position', new Vector2(targetX, targetY));
    var myX = -20;
    var myY = -20;
    if (myHeading !== null) {
      myX = centerX + (innerR - (outerR - innerR)/2) * Math.sin((180 - myHeading) * Math.PI / 180);
      myY = centerY + (innerR - (outerR - innerR)/2) * Math.cos((180 - myHeading) * Math.PI / 180);  
    }
    myHeading = myHeading < 0 ? 360 + myHeading : myHeading;
    me.animate('position', new Vector2(myX, myY));
    // console.log('dist is ' + dist.text() + ' and head is ' + head.text() + '; my heading is ' + myHeading);
  }
}

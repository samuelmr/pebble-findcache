/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var Settings = require('settings');
var innerR = 52;
var outerR = 72;
var centerX = 72;
var centerY = 72;

var myHeading = 105;
var targetHeading = 185;
var targetDistance = '500m';


Settings.config(
  { url: 'https://rawgit.com/samuelmr/pebble-findcache/master/configure.html' },
  function(e) {
    console.log('closed configurable');

    // Show the parsed response
    console.log(JSON.stringify(e.options));

    // Show the raw response if parsing failed
    if (e.failed) {
      console.log(e.response);
    }
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
  position: new Vector2(42, 52),
  size: new Vector2(60, 20),
  font: 'gothic-24-bold',
  text: targetHeading,
  color: 'black',
  textAlign: 'center'
});
main.add(head);

var dist = new UI.Text({
  position: new Vector2(42, 52),
  size: new Vector2(60, 20),
  font: 'gothic-24-bold',
  text: targetDistance,
  color: 'black',
  textAlign: 'center'
});
main.add(dist);

var targetX = centerX + (innerR + (outerR - innerR)/2) * Math.sin((180 - targetHeading) * Math.PI / 180);
var targetY = centerY + (innerR + (outerR - innerR)/2) * Math.cos((180 - targetHeading) * Math.PI / 180);
// console.log(targetX + ' = (' + innerR + ' + ( ' + outerR + ' - ' + innerR + ')/2) * Math.sin(' + targetHeading * Math.PI / 180 + ')');
var myX = centerX + (innerR - (outerR - innerR)/2) * Math.sin((180 - myHeading) * Math.PI / 180);
var myY = centerY + (innerR - (outerR - innerR)/2) * Math.cos((180 - myHeading) * Math.PI / 180);

console.log(myX + ',' + myY + ' => ' + targetX + ',' + targetY);

var target = new UI.Circle({ position: new Vector2(targetX, targetY), backgroundColor: 'black', radius: 8 });
main.add(target);

var me = new UI.Circle({ position: new Vector2(myX, myY), radius: 8 });
main.add(me);

main.show();

main.on('click', 'up', function(e) {
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Pebble.js',
        icon: 'images/menu_icon.png',
        subtitle: 'Can do Menus'
      }, {
        title: 'Second Item',
        subtitle: 'Subtitle Text'
      }]
    }]
  });
  menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
  });
  menu.show();
});

main.on('click', 'select', function(e) {
  var wind = new UI.Window();
  wind.show();
});

main.on('click', 'down', function(e) {
  var card = new UI.Card();
  card.title('A Card');
  card.subtitle('Is a Window');
  card.body('The simplest window type in Pebble.js.');
  card.show();
});

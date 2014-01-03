var fs = require('fs');
var path = require('path');
var Promise = require('es6-promise').Promise;

// Fetch default badge information.
var badgeData = require('./default-badges.json');
var badges = badgeData.badges;
var badge = require('./badge.js');

// Construct the image sheet.
var imageSheet = 'sheet.html';
var resultSheet = '';

// Where the images will be put.
var targetImgDir = 'img';

function makeImage(name, data, cb) {
  badge(data, function(svg) {
    var filename = path.join(targetImgDir, name + '.svg');
    // Put this image on the sheet.
    resultSheet +=  '<p><img src="' + filename + '">';
    // Write the image individually.
    fs.writeFile(filename, svg, cb);
  });
}

// Return a promise to have all images written out individually.
function buildImages() {
  return Promise.all(Object.keys(badges).map(function(name) {
    //console.log('badge', name);
    return new Promise(function(resolve) {
      makeImage(name, badges[name], resolve);
    });
  }));
}

function main() {
  // Write the images individually.
  buildImages()
  .then(function() {
    // Write the sheet.
    //console.log('sheet');
    fs.writeFileSync(imageSheet, resultSheet);
  })
  .catch(function(e) { console.error(e.stack); });
}

main();

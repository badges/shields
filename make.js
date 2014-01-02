var fs = require('fs');
var path = require('path');
var Promise = require('es6-promise').Promise;
var dot = require('dot');
var SVGO = require('svgo');
var badgeData = require('./badges.json');
var badges = badgeData.badges;
var colorscheme = badgeData.colorschemes;
var template = fs.readFileSync('./template.svg');
var imageTemplate = dot.template(''+template);

// Construct the image sheet.
var imageSheet = 'sheet.html';
var resultSheet = '';

// Where the images will be put.
var targetImgDir = 'img';

function optimize(string, callback) {
  var svgo = new SVGO();
  svgo.optimize(string, callback);
}

function makeImage(name, data, cb) {
  if (data.colorscheme) {
    data.colorA = colorscheme[data.colorscheme].colorA;
    data.colorB = colorscheme[data.colorscheme].colorB;
  }
  var result = imageTemplate(data);
  // Run the SVG through SVGO.
  optimize(result, function(object) {
    var result = object.data;
    var filename = path.join(targetImgDir, name + '.svg');
    // Put this image on the sheet.
    resultSheet +=  '<p><img src="' + filename + '">';
    // Write the image individually.
    fs.writeFileSync(filename, result);
    cb();
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

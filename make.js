var fs = require('fs');
var Promise = require('es6-promise').Promise;
var dot = require('dot');
var SVGO = require('svgo');
var badges = require('./badges.json');
var template = fs.readFileSync('./template.svg');
var imageTemplate = dot.template(''+template);

// Construct the image sheet.
var imageSheet = './sheet.html';
var resultSheet = '';

function optimize(string, callback) {
  var svgo = new SVGO();
  svgo.optimize(string, callback);
}

function makeImage(name, data, cb) {
  var result = imageTemplate(data);
  // Run the SVG through SVGO.
  optimize(result, function(object) {
    var result = object.data;
    // Put this image on the sheet.
    resultSheet += result;
    // Write the image individually.
    fs.writeFileSync(name + '.svg', result);
    cb();
  });
}

// Return a promise to have all images written out individually.
function buildImages() {
  return Promise.all(Object.keys(badges).map(function(name) {
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
    fs.writeFileSync(imageSheet, resultSheet);
  });
}

main();

var fs = require('fs');
var SVGO = require('svgo');

// Initialize what will be used for automatic text measurement.
var Canvas = require('canvas');
var canvasElement = new Canvas(0, 0);   // Width and height are irrelevant.
var canvasContext = canvasElement.getContext('2d');
var CanvasFont = Canvas.Font;
try {
  var opensans = new CanvasFont('Verdana', './Verdana.ttf');
  canvasContext.addFont(opensans);
} catch(e) {}
canvasContext.font = '10px Verdana';

// Template crafting action below.
var dot = require('dot');
var colorscheme = require('./colorscheme.json');
var template = fs.readFileSync('./template.svg');
var imageTemplate = dot.template(''+template);

function optimize(string, callback) {
  var svgo = new SVGO();
  svgo.optimize(string, callback);
}

function makeImage(data, cb) {
  if (data.colorscheme) {
    data.colorA = colorscheme[data.colorscheme].colorA;
    data.colorB = colorscheme[data.colorscheme].colorB;
  }
  data.widths = [
    (canvasContext.measureText(data.text[0]).width|0) + 10,
    (canvasContext.measureText(data.text[1]).width|0) + 10,
  ];
  var result = imageTemplate(data);
  // Run the SVG through SVGO.
  optimize(result, function(object) { cb(object.data); });
}

module.exports = makeImage;

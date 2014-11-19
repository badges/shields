var fs = require('fs');
var path = require('path');
var SVGO = require('svgo');
var dot = require('dot');

// Initialize what will be used for automatic text measurement.
var Canvas = require('canvas');
var canvasElement = new Canvas(0, 0);   // Width and height are irrelevant.
var canvasContext = canvasElement.getContext('2d');
var CanvasFont = Canvas.Font;
try {
  var opensans = new CanvasFont('Verdana',
      path.join(__dirname, 'Verdana.ttf'));
  canvasContext.addFont(opensans);
} catch(e) {}
canvasContext.font = '11px Verdana, "DejaVu Sans"';

// cache templates.
var templates = {};
var templateFiles = fs.readdirSync(path.join(__dirname, 'templates'));
dot.templateSettings.strip = false;  // Do not strip whitespace.
templateFiles.forEach(function(filename) {
  var templateData = fs.readFileSync(
    path.join(__dirname, 'templates', filename)).toString();
  var extension = filename.split('.').pop();
  var style = filename.slice(0, -(('-template.' + extension).length));
  templates[style + '-' + extension] = dot.template(templateData);
});

function escapeXml(s) {
  return s.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
}
function addEscapers(data) {
  data.escapeXml = escapeXml;
}

var colorscheme = require(path.join(__dirname, 'colorscheme.json'));

function optimize(string, callback) {
  var svgo = new SVGO();
  svgo.optimize(string, callback);
}

function makeImage(data, cb) {
  if (data.format !== 'json') {
    data.format = 'svg';
  }
  if (!(data.template + '-' + data.format in templates)) {
    data.template = 'default';
  }
  if (data.colorscheme) {
    var pickedColorscheme = colorscheme[data.colorscheme];
    if (!pickedColorscheme) {
      pickedColorscheme = colorscheme.red;
    }
    data.colorA = pickedColorscheme.colorA;
    data.colorB = pickedColorscheme.colorB;
  }
  // String coercion.
  data.text[0] = '' + data.text[0];
  data.text[1] = '' + data.text[1];
  data.widths = [
    (canvasContext.measureText(data.text[0]).width|0) + 10,
    (canvasContext.measureText(data.text[1]).width|0) + 10,
  ];

  var template = templates[data.template + '-' + data.format];
  addEscapers(data);
  try {
    var result = template(data);
  } catch(e) {
    cb('', e);
    return;
  }

  if (data.format === 'json') {
    cb(result);
  } else {
    // Run the SVG through SVGO.
    optimize(result, function(object) { cb(object.data); });
  }
}

module.exports = makeImage;

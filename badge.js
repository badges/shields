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

// cache templates
var templates = {}
var templateFiles = fs.readdirSync('templates')
templateFiles.forEach(function(file) {
  templates[file] = fs.readFileSync(path.join('templates', file)).toString()
})

var colorscheme = require('./colorscheme.json');

function makeTemplate(colorscheme, template) {
  // Template crafting action below.
  var template = templates[(template || 'default') + '-template.svg'];
  var imageTemplate = dot.template(''+template);
  return imageTemplate;
}

var defaultTemplate = makeTemplate();

function optimize(string, callback) {
  var svgo = new SVGO();
  svgo.optimize(string, callback);
}

function makeImage(data, options, cb) {
  if (typeof options === 'function') {
    cb = options
    options = {}
  }
  var template = defaultTemplate;
  if (options.colorscheme || options.template) {
    template = makeTemplate(options.colorscheme, options.template);
  }
  if (data.colorscheme) {
    data.colorA = colorscheme[data.colorscheme].colorA;
    data.colorB = colorscheme[data.colorscheme].colorB;
  }
  data.widths = [
    (canvasContext.measureText(data.text[0]).width|0) + 10,
    (canvasContext.measureText(data.text[1]).width|0) + 10,
  ];
  var result = template(data);
  // Run the SVG through SVGO.
  optimize(result, function(object) { cb(object.data); });
}

module.exports = makeImage;

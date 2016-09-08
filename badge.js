var fs = require('fs');
var path = require('path');
var SVGO = require('svgo');
var dot = require('dot');
var measureTextWidth = require('./measure-text');

// cache templates.
var templates = {};
var templateFiles = fs.readdirSync(path.join(__dirname, 'templates'));
dot.templateSettings.strip = false;  // Do not strip whitespace.
templateFiles.forEach(function(filename) {
  if (filename[0] === '.') { return; }
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
function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}
function addEscapers(data) {
  data.escapeXml = escapeXml;
  data.capitalize = capitalize;
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
    data.template = 'flat';
  }
  if (data.colorscheme) {
    var pickedColorscheme = colorscheme[data.colorscheme];
    if (!pickedColorscheme) {
      pickedColorscheme = colorscheme.red;
    }
    data.colorA = pickedColorscheme.colorA;
    data.colorB = pickedColorscheme.colorB;
  }
  // Logo.
  data.logoWidth = +data.logoWidth || (data.logo? 14: 0);
  data.logoPadding = (data.logo? 3: 0);
  // String coercion.
  data.text[0] = '' + data.text[0];
  data.text[1] = '' + data.text[1];
  if (data.text[0].length === 0) {
    data.logoPadding = 0;
  }

  var textWidth1 = (measureTextWidth(data.text[0])|0);
  var textWidth2 = (measureTextWidth(data.text[1])|0);
  // Increase chances of pixel grid alignment.
  if (textWidth1 % 2 === 0) { textWidth1++; }
  if (textWidth2 % 2 === 0) { textWidth2++; }
  data.widths = [
    textWidth1 + 10 + data.logoWidth + data.logoPadding,
    textWidth2 + 10,
  ];
  if (data.links === undefined) {
    data.links = ['', ''];
  } else {
    for (var i = 0; i < data.links.length; i++) {
      data.links[i] = escapeXml(data.links[i]);
    }
  }

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
module.exports.loadFont = measureTextWidth.loadFont;

var fs = require('fs');
var path = require('path');

var loadLogos = function() {
  var logos = {};
  var logoFiles = fs.readdirSync(path.join(__dirname, 'logo'));
  logoFiles.forEach(function(filename) {
    if (filename[0] === '.') { return; }
    // filename is eg, github.svg
    var svg = fs.readFileSync(
      path.join(__dirname, 'logo', filename)).toString();

    // eg, github
    var name = filename.slice(0, -('.svg'.length));
    logos[name] = 'data:image/svg+xml;base64,' + Buffer(svg).toString('base64');
  });
  return logos;
};

module.exports = loadLogos;

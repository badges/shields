var fs = require('fs');
var path = require('path');

var loadLogos = function() {
  // Cache svg logos from disk in base64 string
  var logos = {};
  var logoDir = path.join(__dirname, '..', 'logo');
  var logoFiles = fs.readdirSync(logoDir);
  logoFiles.forEach(function(filename) {
    if (filename[0] === '.') { return; }
    // filename is eg, github.svg
    var svg = fs.readFileSync(logoDir + '/' + filename).toString();

    // eg, github
    var name = filename.slice(0, -('.svg'.length));
    logos[name] = 'data:image/svg+xml;base64,' +
      Buffer.from(svg).toString('base64');
  });
  return logos;
};

module.exports = loadLogos;

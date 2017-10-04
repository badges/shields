'use strict';

const fs = require('fs');
const path = require('path');

function loadLogos () {
  // Cache svg logos from disk in base64 string
  const logos = {};
  const logoDir = path.join(__dirname, '..', 'logo');
  const logoFiles = fs.readdirSync(logoDir);
  logoFiles.forEach(function(filename) {
    if (filename[0] === '.') { return; }
    // filename is eg, github.svg
    const svg = fs.readFileSync(logoDir + '/' + filename).toString();

    // eg, github
    const name = filename.slice(0, -('.svg'.length));
    logos[name] = 'data:image/svg+xml;base64,' +
      Buffer.from(svg).toString('base64');
  });
  return logos;
}

module.exports = loadLogos;

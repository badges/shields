'use strict';

const fs = require('fs');
const path = require('path');
const SVGO = require('svgo');
const dot = require('dot');
const measureTextWidth = require('./measure-text.js');

// cache templates.
const templates = {};
const templateFiles = fs.readdirSync(path.join(__dirname, '..', 'templates'));
dot.templateSettings.strip = false;  // Do not strip whitespace.
templateFiles.forEach(function(filename) {
  if (filename[0] === '.') { return; }
  const templateData = fs.readFileSync(
    path.join(__dirname, '..', 'templates', filename)).toString();
  const extension = path.extname(filename).slice(1);
  const style = filename.slice(0, -(('-template.' + extension).length));
  // Compile the template. Necessary to always have a working template.
  templates[style + '-' + extension] = dot.template(templateData);
  if (extension === 'svg') {
    // Substitute dot code.
    const mapping = new Map();
    let mappingIndex = 1;
    const untemplatedSvg = templateData.replace(/{{.*?}}/g, function(match) {
      // Weird substitution that currently works for all templates.
      const mapKey = '99999990' + mappingIndex + '.1';
      mappingIndex++;
      mapping.set(mapKey, match);
      return mapKey;
    });
    compressSvg(untemplatedSvg, function(object) {
      if (object.error !== undefined) {
        console.error('Template ' + filename + ': ' + object.error + '\n' +
          '  Generated untemplated SVG:\n' +
          '---\n' + untemplatedSvg + '---\n');
        return;
      }
      // Substitute dot code back.
      let svg = object.data;
      const unmappedKeys = [];
      mapping.forEach(function(value, key) {
        let keySubstituted = false;
        svg = svg.replace(RegExp(key, 'g'), function() {
          keySubstituted = true;
          return value;
        });
        if (!keySubstituted) {
          unmappedKeys.push(key);
        }
      });
      if (unmappedKeys.length > 0) {
        console.error('Template ' + filename + ' has unmapped keys ' +
          unmappedKeys.join(', ') + '.\n' +
          '  Generated untemplated SVG:\n' +
          '---\n' + untemplatedSvg + '\n---\n' +
          '  Generated template:\n' +
          '---\n' + svg + '\n---\n');
        return;
      }
      templates[style + '-' + extension] = dot.template(svg);
    });
  }
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

const colorscheme = require(path.join(__dirname, 'colorscheme.json'));

function compressSvg(string, callback) {
  const svgo = new SVGO();
  svgo.optimize(string, callback);
}

const cssColor = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

function makeBadge (data) {
  if (data.format !== 'json') {
    data.format = 'svg';
  }
  if (!(data.template + '-' + data.format in templates)) {
    data.template = 'flat';
  }
  if (data.template === 'for-the-badge'){
    data.text[0] = ('' + data.text[0]).toUpperCase();
    data.text[1] = ('' + data.text[1]).toUpperCase();
  }
  if (data.colorscheme) {
    let pickedColorscheme = colorscheme[data.colorscheme];
    if (!pickedColorscheme) {
      pickedColorscheme = colorscheme.red;
    }
    data.colorA = data.colorA || pickedColorscheme.colorA;
    data.colorB = data.colorB || pickedColorscheme.colorB;
  }
  // Colors.
  if (!cssColor.test(data.colorA)) { data.colorA = undefined; }
  if (!cssColor.test(data.colorB)) { data.colorB = undefined; }
  // Logo.
  data.logoWidth = +data.logoWidth || (data.logo? 14: 0);
  data.logoPadding = (data.logo? 3: 0);
  // String coercion.
  data.text[0] = '' + data.text[0];
  data.text[1] = '' + data.text[1];
  if (data.text[0].length === 0) {
    data.logoPadding = 0;
  }

  let textWidth1 = (measureTextWidth(data.text[0])|0);
  let textWidth2 = (measureTextWidth(data.text[1])|0);
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
    for (let i = 0; i < data.links.length; i++) {
      data.links[i] = escapeXml(data.links[i]);
    }
  }

  const template = templates[data.template + '-' + data.format];
  addEscapers(data);
  // The call to template() can raise an exception.
  return template(data);
}

module.exports = makeBadge;
module.exports.loadFont = measureTextWidth.loadFont;

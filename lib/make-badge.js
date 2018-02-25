'use strict';

const fs = require('fs');
const path = require('path');
const SVGO = require('svgo');
const dot = require('dot');
const LruCache = require('./lru-cache');

// Holds widths of badge keys (left hand side of badge).
const badgeKeyWidthCache = new LruCache(1000);

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
        console.error(`Template ${filename}: ${object.error}\n` +
          '  Generated untemplated SVG:\n' +
          `---\n${untemplatedSvg}---\n`);
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
        console.error(`Template ${filename} has unmapped keys ` +
          `${unmappedKeys.join(', ')}.\n` +
          '  Generated untemplated SVG:\n' +
          `---\n${untemplatedSvg}\n---\n` +
          '  Generated template:\n' +
          `---\n${svg}\n---\n`);
        return;
      }
      templates[style + '-' + extension] = dot.template(svg);
    });
  }
});

function escapeXml(s) {
  if (s === undefined || typeof s !== 'string') {
    return undefined;
  } else {
    return s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
  }
}

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}

const definedColorschemes = require(path.join(__dirname, 'colorscheme.json'));

function compressSvg(string, callback) {
  const svgo = new SVGO();
  svgo.optimize(string, callback);
}

const cssColor = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

// Inject the measurer to avoid placing any persistent state in this module.
function makeBadge (measurer, {
  format,
  template,
  text,
  colorscheme,
  colorA,
  colorB,
  logo,
  logoWidth,
  links = ['', ''],
}) {
  // String coercion.
  text = text.map(value => '' + value);

  if (format !== 'json') {
    format = 'svg';
  }

  if (!(`${template}-${format}` in templates)) {
    template = format === 'svg' ? 'flat' : 'default';
  }
  if (template === 'social') {
    text[0] = capitalize(text[0]);
  } else if (template === 'for-the-badge') {
    text = text.map(value => value.toUpperCase());
  }

  if (colorscheme) {
    let pickedColorscheme = definedColorschemes[colorscheme];
    if (!pickedColorscheme) {
      pickedColorscheme = definedColorschemes.red;
    }
    colorA = colorA || pickedColorscheme.colorA;
    colorB = colorB || pickedColorscheme.colorB;
  }
  if (!cssColor.test(colorA)) { colorA = undefined; }
  if (!cssColor.test(colorB)) { colorB = undefined; }

  const [left, right] = text;
  let leftWidth = badgeKeyWidthCache.get(left);
  if (leftWidth === undefined) {
    leftWidth = measurer.widthOf(left) | 0;
    // Increase chances of pixel grid alignment.
    if (leftWidth % 2 === 0) { leftWidth++; }
    badgeKeyWidthCache.set(left, leftWidth);
  }
  let rightWidth = measurer.widthOf(right) | 0;
  // Increase chances of pixel grid alignment.
  if (rightWidth % 2 === 0) { rightWidth++; }

  logoWidth = +logoWidth || (logo ? 14 : 0);

  let logoPadding;
  if (left.length === 0) {
    logoPadding = 0;
  } else {
    logoPadding = logo ? 3 : 0;
  }

  const context = {
    text: [left, right],
    escapedText: text.map(escapeXml),
    widths: [
      leftWidth + 10 + logoWidth + logoPadding,
      rightWidth + 10,
    ],
    links: links.map(escapeXml),
    logo,
    logoWidth,
    logoPadding,
    colorA,
    colorB,
    escapeXml,
  };

  const templateFn = templates[`${template}-${format}`];

  // The call to template() can raise an exception.
  return templateFn(context);
}

module.exports = {
  makeBadge,
  makeMakeBadgeFn: measurer => data => makeBadge(measurer, data),
  // Expose for testing.
  _badgeKeyWidthCache: badgeKeyWidthCache,
};

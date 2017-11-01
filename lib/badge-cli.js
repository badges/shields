#!/usr/bin/env node

'use strict';

const makeBadge = require('./make-badge');
const svg2img = require('./svg-to-img');
const colorscheme = require('./colorscheme.json');

if (process.argv.length < 4) {
  console.log('Usage: badge subject status [:colorscheme] [.output] [@style]');
  console.log('Or:    badge subject status right-color [left-color] [.output] [@style]');
  console.log();
  console.log('  colorscheme: one of '
      + Object.keys(colorscheme).join(', ') + '.');
  console.log('  left-color, right-color:');
  console.log('    #xxx (three hex digits)');
  console.log('    #xxxxxx (six hex digits)');
  console.log('    color (CSS color)');
  console.log('  output:');
  console.log('    svg, png, jpg, or gif');
  console.log();
  console.log('Eg: badge cactus grown :green @flat');
  console.log();
  process.exit();
}

// Find a format specifier.
let format = 'svg';
let style = '';
for (let i = 4; i < process.argv.length; i++) {
  if (process.argv[i][0] === '.') {
    format = process.argv[i].slice(1);
    process.argv.splice(i, 1);
    continue;
  }
  if (process.argv[i][0] === '@') {
    style = process.argv[i].slice(1);
    process.argv.splice(i, 1);
    continue;
  }
}

const subject = process.argv[2];
const status = process.argv[3];
let color = process.argv[4] || ':green';
const colorA = process.argv[5];

const badgeData = {text: [subject, status], format: format};
if (style) {
  badgeData.template = style;
}

if (color[0] === ':') {
  color = color.slice(1);
  if (colorscheme[color] == null) {
    // Colorscheme not found.
    console.error('Invalid color scheme.');
    process.exit(1);
  }
  badgeData.colorscheme = color;
} else {
  badgeData.colorB = color;
  if (colorA) { badgeData.colorA = colorA; }
}

const svg = makeBadge(badgeData);

if (/png|jpg|gif/.test(format)) {
  svg2img(svg, format)
    .then(data => {
      process.stdout.write(data);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    })
} else {
  console.log(svg);
}

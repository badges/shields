#!/usr/bin/env node
var path = require('path');
var badge = require(path.join(__dirname, 'badge.js'));
var svg2img = require(path.join(__dirname, 'svg-to-img.js'));
var colorscheme = require(path.join(__dirname, 'colorscheme.json'));
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
var format = 'svg';
var style = '';
for (var i = 4; i < process.argv.length; i++) {
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

var subject = process.argv[2];
var status = process.argv[3];
var color = process.argv[4] || ':green';
var colorA = process.argv[5];

var badgeData = {text: [subject, status]};
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

badge(badgeData, function produceOutput(svg) {
  if (format === 'svg') {
    console.log(svg);
  } else if (/png|jpg|gif/.test(format)) {
    svg2img(svg, format, process.stdout);
  }
});

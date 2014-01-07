var badge = require('./badge.js');
var colorscheme = require('./colorscheme.json');
if (process.argv.length < 4) {
  console.log('Usage: badge subject status :[colorscheme]');
  console.log('Or:    badge subject status right-color [left-color]');
  console.log();
  console.log('  colorscheme: one of '
      + Object.keys(colorscheme).join(', ') + '.');
  console.log('  left-color, right-color:');
  console.log('    #xxx (three hex digits)');
  console.log('    #xxxxxx (six hex digits)');
  console.log('    color (CSS color)');
  console.log();
  console.log('Eg: badge grown cactus :green');
  console.log();
  process.exit();
}

var subject = process.argv[2];
var status = process.argv[3];
var color = process.argv[4] || ':green';
var colorA = process.argv[5];

var badgeData = {text: [subject, status]};

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

badge(badgeData, function(svg) { console.log(svg); });

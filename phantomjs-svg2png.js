var page = require('webpage').create();
var system = require('system');
var svg = system.args[1];
var svgUrl = 'data:image/svg+xml,' + window.encodeURI(svg);
var tmpFile = system.args[2];

page.viewportSize = getSvgDimensions(svg);
page.open(svgUrl, function(status) {
  if (status !== 'success') {
    console.error('Failed to load the following SVG data:');
    console.error(svgUrl);
    phantom.exit(1);
  } else {
    page.render(tmpFile);
    phantom.exit();
  }
});

function getSvgDimensions(svg) {
  var frag = window.document.createElement('div');
  frag.innerHTML = svg;
  var svgRoot = frag.querySelector('svg');
  return {
    width: parseFloat(svgRoot.getAttribute('width') || 80),
    height: parseFloat(svgRoot.getAttribute('height') || 19)
  };
}

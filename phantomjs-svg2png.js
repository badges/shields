var page = require('webpage').create();
var system = require('system');
var svg = system.args[1];
var tmpFile = system.args[2];

// Optional local font loading.
var fs = require('fs');
var fontPath = './Verdana.ttf';
if (fs.isFile(fontPath)) {
  var fontData = fs.read(fontPath, 'b');
  btoa(fontData, function(fontBase64) {
    svg = svg.slice(0, svg.indexOf('</svg>')) + '<style><![CDATA['
      + '@font-face{font-family:"Verdana";src:url(data:font/ttf;base64,'
      + fontBase64 + ');}]]></style></svg>';
    renderSvg(svg);
  });
} else { renderSvg(svg); }

function renderSvg(svg) {
  var svgUrl = 'data:image/svg+xml,' + window.encodeURI(svg);
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
}

function getSvgDimensions(svg) {
  var frag = window.document.createElement('div');
  frag.innerHTML = svg;
  var svgRoot = frag.querySelector('svg');
  return {
    width: parseFloat(svgRoot.getAttribute('width') || 80),
    height: parseFloat(svgRoot.getAttribute('height') || 18)
  };
}

function btoa(data, cb) {
  page.open('about:blank', function(status) {
    if (status !== 'success') {
      console.error('Failed to load blank page.');
      phantom.exit(1);
    } else {
      cb(page.evaluate(function(data) { return window.btoa(data); }, data));
    }
  });
}

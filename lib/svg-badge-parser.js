'use strict';

// Get data from a svg-style badge.
// cb: function(err, string)
// This would be clearer as a synchronous function.
function fetchFromSvg(request, url, cb) {
  request(url, function(err, res, buffer) {
    if (err != null) { return cb(err); }
    try {
      const badge = buffer.replace(/(?:\r\n\s*|\r\s*|\n\s*)/g, '');
      const match = />([^<>]+)<\/text><\/g>/.exec(badge);
      if (!match) { return cb(Error('Cannot fetch from SVG:\n' + buffer)); }
      cb(null, match[1]);
    } catch(e) {
      cb(e);
    }
  });
}

module.exports = {
  fetchFromSvg
};

var gm = require('gm');
var LruCache = require('./lru-cache.js');

var imageMagick = gm.subClass({ imageMagick: true });

// The following is an arbitrary limit (~1.5MB, 1.5kB/image).
var imgCache = new LruCache(1000);

module.exports = function (svg, format, callback) {
  var cacheIndex = format + svg;
  if (imgCache.has(cacheIndex)) {
    // We own a cache for this svg conversion.
    var result = imgCache.get(cacheIndex);
    callback(null, result);
    return;
  }

  var buf = Buffer.from('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + svg);
  imageMagick(buf, 'image.' + format)
  .density(90)
  .background(format === 'jpg' ? '#FFFFFF' : 'none')
  .flatten()
  .toBuffer(format, function (err, data) {
    if (err) {
      callback(err);
    } else {
      imgCache.set(cacheIndex, data);
      callback(null, data);
    }
  });
};

// To simplify testing.
module.exports._imgCache = imgCache;
module.exports._imageMagick = imageMagick;

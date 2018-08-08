'use strict';

const gm = require('gm');
const LruCache = require('./lru-cache');

const imageMagick = gm.subClass({ imageMagick: true });

// The following is an arbitrary limit (~1.5MB, 1.5kB/image).
const imgCache = new LruCache(1000);

function svgToImg (svg, format) {
  return new Promise((resolve, reject) => {
    const cacheIndex = format + svg;
    if (imgCache.has(cacheIndex)) {
      // We own a cache for this svg conversion.
      const result = imgCache.get(cacheIndex);
      resolve(result);
      return;
    }

    const buf = Buffer.from('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + svg);
    imageMagick(buf, 'image.' + format)
      .density(90)
      .background(format === 'jpg' ? '#FFFFFF' : 'none')
      .flatten()
      .toBuffer(format, (err, data) => {
        if (err) {
          reject(err);
        } else {
          imgCache.set(cacheIndex, data);
          resolve(data);
        }
      });
  });
};

module.exports = svgToImg;

// To simplify testing.
module.exports._imgCache = imgCache;
module.exports._imageMagick = imageMagick;

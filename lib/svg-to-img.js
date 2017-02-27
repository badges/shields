var gm = require('gm');
var LruCache = require('./lru-cache.js');

var imageMagick = gm.subClass({ imageMagick: true });

// The following is an arbitrary limit (~1.5MB, 1.5kB/image).
var imgCache = new LruCache(1000);

module.exports = function (svg, format, out, cb) {
  var cacheIndex = format + svg;
  if (imgCache.has(cacheIndex)) {
    // We own a cache for this svg conversion.
    (new DataStream(imgCache.get(cacheIndex))).pipe(out);
    return;
  }

  var buf = new Buffer('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + svg);
  var stream = imageMagick(buf, 'image.' + format)
  .density(90)
  .background(format === 'jpg' ? '#FFFFFF' : 'none')
  .flatten()
  .stream(format, function (err, stdout, stderr) {
    if (err) { console.error(err); }
    stdout.pipe(out);
  });
  stream.on('end', function () {
    stdout.end();
    imgCache.set(cacheIndex, [stdout]);
    cb && cb();
  });
};

// Fake stream from the cache.
var Readable = require('stream').Readable;
var util = require('util');
function DataStream(data) {
  Readable.call(this);
  this.data = data;
  this.i = 0;
}
util.inherits(DataStream, Readable);
DataStream.prototype._read = function() {
  while (this.i < this.data.length) {
    var stop = this.push(this.data[this.i]);
    this.i++;
    if (stop) { return; }
  }
  this.push(null);
};

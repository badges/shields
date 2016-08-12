var fs = require('fs');
var os = require('os');
var path = require('path');
var phantom = require('phantomjs-prebuilt');
var LruCache = require('./lru-cache.js');
var childProcess = require('child_process');
var phantomScript = path.join(__dirname, 'phantomjs-svg2png.js');

// The following is an arbitrary limit (~1.5MB, 1.5kB/image).
var imgCache = new LruCache(1000);

module.exports = function (svg, format, out, cb) {
  var cacheIndex = format + svg;
  if (imgCache.has(cacheIndex)) {
    // We own a cache for this svg conversion.
    (new DataStream(imgCache.get(cacheIndex))).pipe(out);
    return;
  }
  var tmpFile = path.join(os.tmpdir(),
      "svg2img-" + (Math.random()*2147483648|0) + "." + format);
  // Conversion to PNG happens in the phantom script.
  childProcess.execFile(phantom.path, [phantomScript, svg, tmpFile],
  function(err, stdout, stderr) {
    if (stdout) { console.log(stdout); }
    if (stderr) { console.error(stderr); }
    if (err != null) { console.error(err.stack); if (cb) { cb(err); } return; }
    var inStream = fs.createReadStream(tmpFile);
    var cached = [];
    inStream.on('data', function(chunk) {
      cached.push(chunk);
      out.write(chunk);
    });
    // Remove the temporary file after use.
    inStream.on('end', function() {
      try { out.end(); } catch(e) {}
      imgCache.set(cacheIndex, cached);
      fs.unlink(tmpFile, cb);
    });
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

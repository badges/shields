var fs = require('fs');
var os = require('os');
var path = require('path');
var phantom = require('phantomjs');
var childProcess = require('child_process');
var phantomScript = path.join(__dirname, 'phantomjs-svg2png.js');

var imgCache = Object.create(null);
var imgCacheTime = Object.create(null);
var imgCacheSize = 0;
// The following is an arbitrary limit (~1.5MB, 1.5kB/image).
var imgCacheMaxSize = 1000;

module.exports = function (svg, format, out, cb) {
  var cacheIndex = format + svg;
  if (imgCache[cacheIndex] !== undefined) {
    // We own a cache for this svg conversion.
    (new DataStream(imgCache[cacheIndex])).pipe(out);
    imgCacheTime[cacheIndex] = +(new Date());
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
      addToCache(cacheIndex, cached);
      fs.unlink(tmpFile, cb);
    });
  });
};

function addToCache(cacheIndex, cached) {
  imgCache[cacheIndex] = cached;
  var mostAncient = +(new Date());
  imgCacheTime[cacheIndex] = mostAncient;
  if (imgCacheSize >= imgCacheMaxSize) {
    // Find the most ancient image.
    var ancientCacheIndex = cacheIndex;
    for (var currentCacheIndex in imgCacheTime) {
      if (mostAncient > imgCacheTime[currentCacheIndex]) {
        mostAncient = imgCacheTime[currentCacheIndex];
        ancientCacheIndex = currentCacheIndex;
      }
    }
    // Delete that image.
    delete imgCache[ancientCacheIndex];
    delete imgCacheTime[ancientCacheIndex];
  } else {
    imgCacheSize++;
  }
}

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

var fs = require('fs');
var os = require('os');
var path = require('path');
var phantom = require('phantomjs');
var childProcess = require('child_process');
var phantomScript = path.join(__dirname, 'phantomjs-svg2png.js');

var imgCache = Object.create(null);

// If available, use the font here.
var fontPath = './Verbana.ttf';
try {
  // This happens at startup. Needn't be async.
  var fontBase64 = fs.readFileSync(fontPath, 'base64');
} catch(e) {}

module.exports = function (svg, format, out, cb) {
  var cacheIndex = format + svg;
  if (imgCache[cacheIndex] !== undefined) {
    // We own a cache for this svg conversion.
    imgCache[cacheIndex].pipe(out);
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
      out.end();
      imgCache[cacheIndex] = streamFromData(cached);
      fs.unlink(tmpFile, cb);
    });
  });
};

// Fake stream from the cache.
var stream = require('stream');
function streamFromData(data) {
  var newStream = new stream.Readable();
  newStream._read = function() {
    for (var i = 0; i < data.length; i++) {
      newStream.push(data[i]);
    }
    newStream.push(null)
  };
  return newStream;
}

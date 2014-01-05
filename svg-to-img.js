var fs = require('fs');
var os = require('os');
var path = require('path');
var phantom = require('phantomjs');
var childProcess = require('child_process');
var phantomScript = path.join(__dirname, 'phantomjs-svg2png.js');

module.exports = function (svg, format, out, cb) {
  var tmpFile = path.join(os.tmpdir(),
      "svg2img-" + (Math.random()*2147483648|0) + "." + format);
  // Conversion to PNG happens in the phantom script.
  childProcess.execFile(phantom.path, [phantomScript, svg, tmpFile],
  function(err, stdout, stderr) {
    if (stdout) { console.log(stdout); }
    if (stderr) { console.log(stderr); }
    if (err != null) { console.error(err.stack); if (cb) { cb(err); } return; }
    var inStream = fs.createReadStream(tmpFile);
    inStream.pipe(out);
    // Remove the temporary file after use.
    inStream.on('end', function() { fs.unlink(tmpFile, cb); });
  });
};

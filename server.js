var camp = require('camp').start({ port: +process.argv[2]||80 });
var badge = require('./badge.js');

// Escapes `t` using the format specified in
// <https://github.com/espadrine/gh-badges/issues/12#issuecomment-31518129>
function escapeFormat(t) {
  return t.replace('_', ' ').replace('__', '_').replace('--', '-');
}

camp.route(/^\/(([^-]|--)+)-(([^-]|--)+)-(([^-]|--)+).svg$/,
  function(data, match, end, ask) {
    var subject = escapeFormat(match[1]);
    var status = escapeFormat(match[3]);
    var color = escapeFormat(match[5]);
    ask.res.setHeader('Content-Type', 'image/svg+xml');
    try {
      badge({text: [subject, status], colorscheme: color}, function(res) {
        end(null, {template: streamFromString(res)});
      });
    } catch(e) {
      badge({text: ["error", "bad badge"], colorscheme: "red"}, function(res) {
        end(null, {template: streamFromString(res)});
      });
    }
});

var stream = require('stream');
function streamFromString(str) {
  var newStream = new stream.Readable();
  newStream._read = function() { newStream.push(str); newStream.push(null); };
  return newStream;
}

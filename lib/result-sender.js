'use strict';

const log = require('./log');
const svg2img = require('./svg-to-img');

function makeSend(format, askres, end) {
  if (format === 'svg') {
    return function(res) { sendSVG(res, askres, end); };
  } else if (format === 'json') {
    return function(res) { sendJSON(res, askres, end); };
  } else {
    return function(res) { sendOther(format, res, askres, end); };
  }
}

function sendSVG(res, askres, end) {
  askres.setHeader('Content-Type', 'image/svg+xml;charset=utf-8');
  end(null, {template: streamFromString(res)});
}

function sendOther(format, res, askres, end) {
  askres.setHeader('Content-Type', 'image/' + format);
  svg2img(res, format, function (err, data) {
    if (err) {
      // This emits status code 200, though 500 would be preferable.
      log.error('svg2img error', err);
      end(null, {template: '500.html'});
    } else {
      end(null, {template: streamFromString(data)});
    }
  });
}

function sendJSON(res, askres, end) {
  askres.setHeader('Content-Type', 'application/json');
  askres.setHeader('Access-Control-Allow-Origin', '*');
  end(null, {template: streamFromString(res)});
}

const stream = require('stream');
function streamFromString(str) {
  const newStream = new stream.Readable();
  newStream._read = function() { newStream.push(str); newStream.push(null); };
  return newStream;
}

module.exports = {
  makeSend
};

var camp = require('camp').start({
  port: process.env.PORT||+process.argv[2]||80
});
var https = require('https');
var http = require('http');
var badge = require('./badge.js');
var svg2img = require('./svg-to-img.js');
var serverStartTime = new Date((new Date()).toGMTString());

// Travis integration
camp.route(/^\/travis\/([^\/]+\/[^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg)$/,
function(data, match, end, ask) {
  var userRepo = match[1];
  var branch = match[2];
  var format = match[3];
  var options = {
    method: 'HEAD',
    hostname: 'api.travis-ci.org',
    path: '/' + userRepo + '.png'
  };
  if (branch) {
    options.path += '?branch=' + branch;
  }
  var badgeData = {text:['build', 'n/a'], colorscheme:'lightgrey'};
  var req = https.request(options, function(res) {
    var statusMatch = res.headers['content-disposition'].match(/filename="(.+)\.png"/);
    if (!statusMatch) {
      badgeData.text[1] = 'unknown';
      badge(badgeData, makeSend(format, ask.res, end));
      return;
    }
    var state = statusMatch[1];
    badgeData.text[1] = state;
    if (state === 'passing') {
      badgeData.colorscheme = 'green';
    } else if (state === 'failing') {
      badgeData.colorscheme = 'red';
    }
    badge(badgeData, makeSend(format, ask.res, end));
  });
  req.on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    badge(badgeData, makeSend(format, ask.res, end));
  });
  req.end();
});

// Gittip integration.
camp.route(/^\/gittip\/(.*)\.(svg|png|gif|jpg)$/,
function(data, match, end, ask) {
  var user = match[1];  // eg, `JSFiddle`.
  var format = match[2];
  var apiUrl = 'https://www.gittip.com/' + user + '/public.json';
  var badgeData = {text:['tips', 'n/a'], colorscheme:'lightgrey'};
  https.get(apiUrl, function(res) {
    var buffer = '';
    res.on('data', function(chunk) { buffer += ''+chunk; });
    res.on('end', function(chunk) {
      if (chunk) { buffer += ''+chunk; }
      try {
        var data = JSON.parse(buffer);
        var money = parseInt(data.receiving);
      } catch(e) {
        badgeData.text[1] = 'invalid';
        badge(badgeData, makeSend(format, ask.res, end));
        return;
      }
      badgeData.text[1] = '$' + metric(money) + '/week';
      if (money === 0) {
        badgeData.colorscheme = 'red';
      } else if (money < 10) {
        badgeData.colorscheme = 'yellow';
      } else if (money < 100) {
        badgeData.colorscheme = 'yellowgreen';
      } else {
        badgeData.colorscheme = 'green';
      }
      badge(badgeData, makeSend(format, ask.res, end));
    });
  }).on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    badge(badgeData, makeSend(format, ask.res, end));
  });
});

// Packagist integration.
camp.route(/^\/packagist\/dm\/(.*)\.(svg|png|gif|jpg)$/,
function(data, match, end, ask) {
  var userRepo = match[1];  // eg, `doctrine/orm`.
  var format = match[2];
  var apiUrl = 'https://packagist.org/packages/' + userRepo + '.json';
  var badgeData = {text:['downloads', 'n/a'], colorscheme:'lightgrey'};
  https.get(apiUrl, function(res) {
    var buffer = '';
    res.on('data', function(chunk) { buffer += ''+chunk; });
    res.on('end', function(chunk) {
      if (chunk) { buffer += ''+chunk; }
      try {
        var data = JSON.parse(buffer);
        var monthly = data.package.downloads.monthly;
      } catch(e) {
        badgeData.text[1] = 'invalid';
        badge(badgeData, makeSend(format, ask.res, end));
        return;
      }
      badgeData.text[1] = metric(monthly) + '/month';
      if (monthly === 0) {
        badgeData.colorscheme = 'red';
      } else if (monthly < 10) {
        badgeData.colorscheme = 'yellow';
      } else if (monthly < 100) {
        badgeData.colorscheme = 'yellowgreen';
      } else {
        badgeData.colorscheme = 'green';
      }
      badge(badgeData, makeSend(format, ask.res, end));
    });
  }).on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    badge(badgeData, makeSend(format, ask.res, end));
  });
});

// NPM integration.
camp.route(/^\/npm\/dm\/(.*)\.(svg|png|gif|jpg)$/,
function(data, match, end, ask) {
  var user = match[1];  // eg, `localeval`.
  var format = match[2];
  var apiUrl = 'http://isaacs.iriscouch.com/downloads/_design/app/_view/pkg?group_level=2&start_key=["' + user + '"]&end_key=["' + user + '",{}]';
  var badgeData = {text:['downloads', 'n/a'], colorscheme:'lightgrey'};
  http.get(apiUrl, function(res) {
    var buffer = '';
    res.on('data', function(chunk) { buffer += ''+chunk; });
    res.on('end', function(chunk) {
      if (chunk) { buffer += ''+chunk; }
      try {
        var data = JSON.parse(buffer);
        var monthly = 0;
        // getMonth() returns a 0-indexed month, ie, last month.
        var now = new Date();
        var lastMonth = now.getMonth();
        var year = now.getFullYear();
        if (lastMonth === 0) { lastMonth = 12; year--; }
        for (var i = 0; i < data.rows.length; i++) {
          // date contains ['year', 'month', 'day'].
          var date = data.rows[i].key[1].split('-');
          if (+date[0] === year && +date[1] === lastMonth) {
            monthly += data.rows[i].value;
          }
        }
      } catch(e) {
        badgeData.text[1] = 'invalid';
        badge(badgeData, makeSend(format, ask.res, end));
        return;
      }
      badgeData.text[1] = metric(monthly) + '/month';
      if (monthly === 0) {
        badgeData.colorscheme = 'red';
      } else if (monthly < 10) {
        badgeData.colorscheme = 'yellow';
      } else if (monthly < 100) {
        badgeData.colorscheme = 'yellowgreen';
      } else {
        badgeData.colorscheme = 'green';
      }
      badge(badgeData, makeSend(format, ask.res, end));
    });
  }).on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    badge(badgeData, makeSend(format, ask.res, end));
  });
});

// NPM version integration.
camp.route(/^\/npm\/v\/(.*)\.(svg|png|gif|jpg)$/,
function(data, match, end, ask) {
  var repo = match[1];  // eg, `localeval`.
  var format = match[2];
  var apiUrl = 'https://registry.npmjs.org/' + repo + '/latest';
  var badgeData = {text:['npm', 'n/a'], colorscheme:'lightgrey'};
  https.get(apiUrl, function(res) {
    var buffer = '';
    res.on('data', function(chunk) { buffer += ''+chunk; });
    res.on('end', function(chunk) {
      if (chunk) { buffer += ''+chunk; }
      try {
        var data = JSON.parse(buffer);
        var version = data.version;
      } catch(e) {
        badgeData.text[1] = 'invalid';
        badge(badgeData, makeSend(format, ask.res, end));
        return;
      }
      badgeData.text[1] = 'v' + version;
      if (version[0] === '0' || /dev/.test(version)) {
        badgeData.colorscheme = 'orange';
      } else {
        badgeData.colorscheme = 'blue';
      }
      badge(badgeData, makeSend(format, ask.res, end));
    });
  }).on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    badge(badgeData, makeSend(format, ask.res, end));
  });
});

// Gem version integration.
camp.route(/^\/gem\/v\/(.*)\.(svg|png|gif|jpg)$/,
function(data, match, end, ask) {
  var repo = match[1];  // eg, `localeval`.
  var format = match[2];
  var apiUrl = 'https://rubygems.org/api/v1/gems/' + repo + '.json';
  var badgeData = {text:['gem', 'n/a'], colorscheme:'lightgrey'};
  https.get(apiUrl, function(res) {
    var buffer = '';
    res.on('data', function(chunk) { buffer += ''+chunk; });
    res.on('end', function(chunk) {
      if (chunk) { buffer += ''+chunk; }
      try {
        var data = JSON.parse(buffer);
        var version = data.version;
      } catch(e) {
        badgeData.text[1] = 'invalid';
        badge(badgeData, makeSend(format, ask.res, end));
        return;
      }
      badgeData.text[1] = 'v' + version;
      if (version[0] === '0' || /dev/.test(version)) {
        badgeData.colorscheme = 'orange';
      } else {
        badgeData.colorscheme = 'blue';
      }
      badge(badgeData, makeSend(format, ask.res, end));
    });
  }).on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    badge(badgeData, makeSend(format, ask.res, end));
  });
});

// Coveralls integration.
camp.route(/^\/coveralls\/([^\/]+\/[^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg)$/,
function(data, match, end, ask) {
  var userRepo = match[1];  // eg, `jekyll/jekyll`.
  var branch = match[2];
  var format = match[3];
  var apiUrl = 'https://coveralls.io/repos/' + userRepo + '/badge.png';
  if (branch) {
    apiUrl += '?branch=' + branch;
  }
  var badgeData = {text:['coverage', 'n/a'], colorscheme:'lightgrey'};
  https.get(apiUrl, function(res) {
    // We should get a 302. Look inside the Location header.
    var buffer = res.headers.location;
    if (!buffer) {
      badgeData.text[1] = 'invalid';
      badge(badgeData, makeSend(format, ask.res, end));
      return;
    }
    try {
      var score = buffer.split('_')[1].split('.')[0];
      var percentage = parseInt(score);
      if (percentage !== percentage) {
        // It is NaN, treat it as unknown.
        badgeData.text[1] = 'unknown';
        badge(badgeData, makeSend(format, ask.res, end));
        return;
      }
    } catch(e) {
      badgeData.text[1] = 'malformed';
      badge(badgeData, makeSend(format, ask.res, end));
      return;
    }
    badgeData.text[1] = score + '%';
    if (percentage < 80) {
      badgeData.colorscheme = 'red';
    } else if (percentage < 90) {
      badgeData.colorscheme = 'yellow';
    } else {
      badgeData.colorscheme = 'green';
    }
    badge(badgeData, makeSend(format, ask.res, end));
  }).on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    badge(badgeData, makeSend(format, ask.res, end));
  });
});

// Any badge.
camp.route(/^\/:(([^-]|--)+)-(([^-]|--)+)-(([^-]|--)+)\.(svg|png|gif|jpg)$/,
function(data, match, end, ask) {
  var subject = escapeFormat(match[1]);
  var status = escapeFormat(match[3]);
  var color = escapeFormat(match[5]);
  var format = match[7];

  // Cache management.
  var cacheDuration = (3600*24*1)|0;  // 1 day.
  ask.res.setHeader('Cache-Control', 'public, max-age=' + cacheDuration);
  if (+(new Date(ask.req.headers['if-modified-since'])) >= +serverStartTime) {
    ask.res.statusCode = 304;
    ask.res.end();  // not modified.
    return;
  }
  ask.res.setHeader('Last-Modified', serverStartTime.toGMTString());

  // Badge creation.
  try {
    var badgeData = {text: [subject, status]};
    if (sixHex(color)) {
      badgeData.colorB = '#' + color;
    } else {
      badgeData.colorscheme = color;
    }
    badge(badgeData, makeSend(format, ask.res, end));
  } catch(e) {
    badge({text: ['error', 'bad badge'], colorscheme: 'red'},
      makeSend(format, ask.res, end));
  }
});

// Escapes `t` using the format specified in
// <https://github.com/espadrine/gh-badges/issues/12#issuecomment-31518129>
function escapeFormat(t) {
  return t
    // Inline single underscore.
    .replace(/([^_])_([^_])/g, '$1 $2')
    // Leading or trailing underscore.
    .replace(/([^_])_$/, '$1 ').replace(/^_([^_])/, ' $1')
    // Double underscore and double dash.
    .replace(/__/g, '_').replace(/--/g, '-');
}

function sixHex(s) { return /^[0-9a-fA-F]{6}$/.test(s); }

function makeSend(format, askres, end) {
  if (format === 'svg') {
    return function(res) { sendSVG(res, askres, end); };
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
  svg2img(res, format, askres);
}

var stream = require('stream');
function streamFromString(str) {
  var newStream = new stream.Readable();
  newStream._read = function() { newStream.push(str); newStream.push(null); };
  return newStream;
}

// Given a number, string with appropriate unit in the metric system, SI.
function metric(n) {
  var limit = 1000;
  if (n > limit) {
    n = Math.round(n / 1000);
    return ''+n + 'k';
  } else {
    return ''+n;
  }
}

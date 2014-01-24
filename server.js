var camp = require('camp').start({
  port: +process.env.PORT||+process.argv[2]||80
});
var https = require('https');
var http = require('http');
var badge = require('./badge.js');
var svg2img = require('./svg-to-img.js');
var serverStartTime = new Date((new Date()).toGMTString());

// Cache

var cacheTimeout = 60000;   // 1 minute.
var cacheFromIndex = Object.create(null);

function cache(f) {
  return function getRequest(data, match, end, ask) {
    var cacheIndex = match[0] + '?label=' + data.label;
    // Should we return the data right away?
    var cached = cacheFromIndex[cacheIndex];
    if (cached != null) {
      badge(cached.badgeData, makeSend(cached.format, ask.res, end));
      return;
    }

    f(data, match, function sendBadge(format, badgeData) {
      cacheFromIndex[cacheIndex] = { format: format, badgeData: badgeData };
      setTimeout(function clearCache() {
        delete cacheFromIndex[cacheIndex];
      }, cacheTimeout);
      badge(badgeData, makeSend(format, ask.res, end));
    });
  };
}

// Vendors.

// Travis integration
camp.route(/^\/travis(-ci)?\/([^\/]+\/[^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg)$/,
cache(function(data, match, sendBadge) {
  var userRepo = match[2];
  var branch = match[3];
  var format = match[4];
  var options = {
    method: 'HEAD',
    hostname: 'api.travis-ci.org',
    path: '/' + userRepo + '.png'
  };
  if (branch) {
    options.path += '?branch=' + branch;
  }
  var label = getLabel('build', data);
  var badgeData = {text:[label, 'n/a'], colorscheme:'lightgrey'};
  var req = https.request(options, function(res) {
    try {
      var statusMatch = res.headers['content-disposition']
                           .match(/filename="(.+)\.png"/);
    } catch(e) {
      badgeData.text[1] = 'not found';
      sendBadge(format, badgeData);
      return;
    }
    if (!statusMatch) {
      badgeData.text[1] = 'unknown';
      sendBadge(format, badgeData);
      return;
    }
    var state = statusMatch[1];
    badgeData.text[1] = state;
    if (state === 'passing') {
      badgeData.colorscheme = 'brightgreen';
    } else if (state === 'failing') {
      badgeData.colorscheme = 'red';
    }
    sendBadge(format, badgeData);
  });
  req.on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    sendBadge(format, badgeData);
  });
  req.end();
}));

// Gittip integration.
camp.route(/^\/gittip\/(.*)\.(svg|png|gif|jpg)$/,
cache(function(data, match, sendBadge) {
  var user = match[1];  // eg, `JSFiddle`.
  var format = match[2];
  var apiUrl = 'https://www.gittip.com/' + user + '/public.json';
  var label = getLabel('tips', data);
  var badgeData = {text:[label, 'n/a'], colorscheme:'lightgrey'};
  var redirectCount = 0;
  https.get(apiUrl, function dealWithData(res) {
    // Is it a redirection?
    if (res.statusCode === 302 && res.headers.location && redirectCount++ < 1) {
      https.get('https://www.gittip.com/' + res.headers.location, dealWithData);
      return;
    }
    var buffer = '';
    res.on('data', function(chunk) { buffer += ''+chunk; });
    res.on('end', function(chunk) {
      if (chunk) { buffer += ''+chunk; }
      try {
        var data = JSON.parse(buffer);
        var money = parseInt(data.receiving);
      } catch(e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
        return;
      }
      badgeData.text[1] = '$' + metric(money) + '/week';
      if (money === 0) {
        badgeData.colorscheme = 'red';
      } else if (money < 10) {
        badgeData.colorscheme = 'yellow';
      } else if (money < 100) {
        badgeData.colorscheme = 'green';
      } else {
        badgeData.colorscheme = 'brightgreen';
      }
      sendBadge(format, badgeData);
    });
  }).on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    sendBadge(format, badgeData);
  });
}));

// Packagist integration.
camp.route(/^\/packagist\/dm\/(.*)\.(svg|png|gif|jpg)$/,
cache(function(data, match, sendBadge) {
  var userRepo = match[1];  // eg, `doctrine/orm`.
  var format = match[2];
  var apiUrl = 'https://packagist.org/packages/' + userRepo + '.json';
  var label = getLabel('downloads', data);
  var badgeData = {text:[label, 'n/a'], colorscheme:'lightgrey'};
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
        sendBadge(format, badgeData);
        return;
      }
      badgeData.text[1] = metric(monthly) + '/month';
      if (monthly === 0) {
        badgeData.colorscheme = 'red';
      } else if (monthly < 10) {
        badgeData.colorscheme = 'yellow';
      } else if (monthly < 100) {
        badgeData.colorscheme = 'yellowgreen';
      } else if (monthly < 1000) {
        badgeData.colorscheme = 'green';
      } else {
        badgeData.colorscheme = 'brightgreen';
      }
      sendBadge(format, badgeData);
    });
  }).on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    sendBadge(format, badgeData);
  });
}));

// NPM integration.
camp.route(/^\/npm\/dm\/(.*)\.(svg|png|gif|jpg)$/,
cache(function(data, match, sendBadge) {
  var user = match[1];  // eg, `localeval`.
  var format = match[2];
  var apiUrl = 'http://isaacs.iriscouch.com/downloads/_design/app/_view/pkg?group_level=2&start_key=["' + user + '"]&end_key=["' + user + '",{}]';
  var label = getLabel('downloads', data);
  var badgeData = {text:[label, 'n/a'], colorscheme:'lightgrey'};
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
        sendBadge(format, badgeData);
        return;
      }
      badgeData.text[1] = metric(monthly) + '/month';
      if (monthly === 0) {
        badgeData.colorscheme = 'red';
      } else if (monthly < 10) {
        badgeData.colorscheme = 'yellow';
      } else if (monthly < 100) {
        badgeData.colorscheme = 'yellowgreen';
      } else if (monthly < 1000) {
        badgeData.colorscheme = 'green';
      } else {
        badgeData.colorscheme = 'brightgreen';
      }
      sendBadge(format, badgeData);
    });
  }).on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    sendBadge(format, badgeData);
  });
}));

// NPM version integration.
camp.route(/^\/npm\/v\/(.*)\.(svg|png|gif|jpg)$/,
cache(function(data, match, sendBadge) {
  var repo = match[1];  // eg, `localeval`.
  var format = match[2];
  var apiUrl = 'https://registry.npmjs.org/' + repo + '/latest';
  var label = getLabel('npm', data);
  var badgeData = {text:[label, 'n/a'], colorscheme:'lightgrey'};
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
        sendBadge(format, badgeData);
        return;
      }
      badgeData.text[1] = 'v' + version;
      if (version[0] === '0' || /dev/.test(version)) {
        badgeData.colorscheme = 'orange';
      } else {
        badgeData.colorscheme = 'blue';
      }
      sendBadge(format, badgeData);
    });
  }).on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    sendBadge(format, badgeData);
  });
}));

// Gem version integration.
camp.route(/^\/gem\/v\/(.*)\.(svg|png|gif|jpg)$/,
cache(function(data, match, sendBadge) {
  var repo = match[1];  // eg, `localeval`.
  var format = match[2];
  var apiUrl = 'https://rubygems.org/api/v1/gems/' + repo + '.json';
  var label = getLabel('gem', data);
  var badgeData = {text:[label, 'n/a'], colorscheme:'lightgrey'};
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
        sendBadge(format, badgeData);
        return;
      }
      badgeData.text[1] = 'v' + version;
      if (version[0] === '0' || /dev/.test(version)) {
        badgeData.colorscheme = 'orange';
      } else {
        badgeData.colorscheme = 'blue';
      }
      sendBadge(format, badgeData);
    });
  }).on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    sendBadge(format, badgeData);
  });
}));

// PyPI integration.
camp.route(/^\/pypi\/([^\/]+)\/(.*)\.(svg|png|gif|jpg)$/,
cache(function(data, match, sendBadge) {
  var info = match[1];
  var egg = match[2];  // eg, `gevent`.
  var format = match[3];
  var apiUrl = 'https://pypi.python.org/pypi/' + egg + '/json';
  var label = getLabel('pypi', data);
  var badgeData = {text:[label, 'n/a'], colorscheme:'lightgrey'};
  https.get(apiUrl, function(res) {
    var buffer = '';
    res.on('data', function(chunk) { buffer += ''+chunk; });
    res.on('end', function(chunk) {
      if (chunk) { buffer += ''+chunk; }
      try {
        var data = JSON.parse(buffer);
      } catch(e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
        return;
      }
      if (info === 'dm') {
        badgeData.text[0] = getLabel('downloads', data);
        try {
          var monthly = data.info.downloads.last_month;
        } catch(e) {
          badgeData.text[1] = 'invalid';
          sendBadge(format, badgeData);
          return;
        }
        badgeData.text[1] = metric(monthly) + '/month';
        if (monthly === 0) {
          badgeData.colorscheme = 'red';
        } else if (monthly < 10) {
          badgeData.colorscheme = 'yellow';
        } else if (monthly < 100) {
          badgeData.colorscheme = 'yellowgreen';
        } else if (monthly < 1000) {
          badgeData.colorscheme = 'green';
        } else {
          badgeData.colorscheme = 'brightgreen';
        }
        sendBadge(format, badgeData);
      } else if (info === 'v') {
        try {
          var version = data.info.version;
        } catch(e) {
          badgeData.text[1] = 'invalid';
          sendBadge(format, badgeData);
          return;
        }
        badgeData.text[1] = 'v' + version;
        if (version[0] === '0' || /dev/.test(version)) {
          badgeData.colorscheme = 'orange';
        } else {
          badgeData.colorscheme = 'blue';
        }
        sendBadge(format, badgeData);
      }
    });
  }).on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    sendBadge(format, badgeData);
  });
}));

// Coveralls integration.
camp.route(/^\/coveralls\/([^\/]+\/[^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg)$/,
cache(function(data, match, sendBadge) {
  var userRepo = match[1];  // eg, `jekyll/jekyll`.
  var branch = match[2];
  var format = match[3];
  var apiUrl = 'https://coveralls.io/repos/' + userRepo + '/badge.png';
  if (branch) {
    apiUrl += '?branch=' + branch;
  }
  var label = getLabel('coverage', data);
  var badgeData = {text:[label, 'n/a'], colorscheme:'lightgrey'};
  https.get(apiUrl, function(res) {
    // We should get a 302. Look inside the Location header.
    var buffer = res.headers.location;
    if (!buffer) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var score = buffer.split('_')[1].split('.')[0];
      var percentage = parseInt(score);
      if (percentage !== percentage) {
        // It is NaN, treat it as unknown.
        badgeData.text[1] = 'unknown';
        sendBadge(format, badgeData);
        return;
      }
    } catch(e) {
      badgeData.text[1] = 'malformed';
      sendBadge(format, badgeData);
      return;
    }
    badgeData.text[1] = score + '%';
    if (percentage < 80) {
      badgeData.colorscheme = 'red';
    } else if (percentage < 90) {
      badgeData.colorscheme = 'yellow';
    } else if (percentage < 95) {
      badgeData.colorscheme = 'green';
    } else {
      badgeData.colorscheme = 'brightgreen';
    }
    sendBadge(format, badgeData);
  }).on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    sendBadge(format, badgeData);
  });
}));

// Code Climate integration
camp.route(/^\/codeclimate\/(.+)\.(svg|png|gif|jpg)$/,
cache(function(data, match, sendBadge) {
  var userRepo = match[1];  // eg, `github/kabisaict/flow`.
  var format = match[2];
  var options = {
    method: 'HEAD',
    hostname: 'codeclimate.com',
    path: '/' + userRepo + '.png'
  };
  var label = getLabel('code climate', data);
  var badgeData = {text:[label, 'n/a'], colorscheme:'lightgrey'};
  var req = https.request(options, function(res) {
    try {
      var statusMatch = res.headers['content-disposition']
                           .match(/filename="code_climate-(.+)\.png"/);
    } catch(e) {
      badgeData.text[1] = 'not found';
      sendBadge(format, badgeData);
      return;
    }
    if (!statusMatch) {
      badgeData.text[1] = 'unknown';
      sendBadge(format, badgeData);
      return;
    }
    var state = statusMatch[1].replace('-', '.');
    var score = +state;
    badgeData.text[1] = state;
    if (score == 4) {
      badgeData.colorscheme = 'brightgreen';
    } else if (score > 3) {
      badgeData.colorscheme = 'green';
    } else if (score > 2) {
      badgeData.colorscheme = 'yellowgreen';
    } else if (score > 1) {
      badgeData.colorscheme = 'yellow';
    } else {
      badgeData.colorscheme = 'red';
    }
    sendBadge(format, badgeData);
  });
  req.on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    sendBadge(format, badgeData);
  });
  req.end();
}));

// Code Climate integration
camp.route(/^\/gemnasium\/(.+)\.(svg|png|gif|jpg)$/,
cache(function(data, match, sendBadge) {
  var userRepo = match[1];  // eg, `jekyll/jekyll`.
  var format = match[2];
  var options = {
    method: 'HEAD',
    hostname: 'gemnasium.com',
    path: '/' + userRepo + '.png'
  };
  var label = getLabel('dependencies', data);
  var badgeData = {text:[label, 'n/a'], colorscheme:'lightgrey'};
  var req = https.request(options, function(res) {
    try {
      var statusMatch = res.headers['content-disposition']
                           .match(/filename="(.+)\.png"/);
    } catch(e) {
      badgeData.text[1] = 'not found';
      sendBadge(format, badgeData);
      return;
    }
    if (!statusMatch) {
      badgeData.text[1] = 'unknown';
      sendBadge(format, badgeData);
      return;
    }
    // Either `dev-yellow` or `yellow`.
    var state = statusMatch[1].split('-');  //
    var color = state.pop();
    if (state[0] === 'dev') { badgeData.text[0] = 'devDependencies'; }
    if (color === 'green') {
      badgeData.text[1] = 'up-to-date';
      badgeData.colorscheme = 'brightgreen';
    } else if (color === 'yellow') {
      badgeData.text[1] = 'out-of-date';
      badgeData.colorscheme = 'yellow';
    } else if (color === 'red') {
      badgeData.text[1] = 'update!';
      badgeData.colorscheme = 'red';
    } else if (color === 'none') {
      badgeData.text[1] = 'none';
      badgeData.colorscheme = 'brightgreen';
    } else {
      badgeData.text[1] = 'undefined';
    }
    sendBadge(format, badgeData);
  });
  req.on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    sendBadge(format, badgeData);
  });
  req.end();
}));

// Any badge.
camp.route(/^\/(:|badge\/)(([^-]|--)+)-(([^-]|--)+)-(([^-]|--)+)\.(svg|png|gif|jpg)$/,
function(data, match, end, ask) {
  var subject = escapeFormat(match[2]);
  var status = escapeFormat(match[4]);
  var color = escapeFormat(match[6]);
  var format = match[8];

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

// Any badge, old version.
camp.route(/^\/([^\/]+)\/(.+).png$/,
function(data, match, end, ask) {
  var subject = match[1];
  var status = match[2];
  var color = data.color;

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
    badgeData.colorscheme = color;
    badge(badgeData, makeSend('png', ask.res, end));
  } catch(e) {
    badge({text: ['error', 'bad badge'], colorscheme: 'red'},
      makeSend('png', ask.res, end));
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

function getLabel(label, data) {
  return data.label || label;
}

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

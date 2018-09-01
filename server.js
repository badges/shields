'use strict';

const { DOMParser } = require('xmldom');
const jp = require('jsonpath');
const path = require('path');
const xpath = require('xpath');
const yaml = require('js-yaml');
const Raven = require('raven');

const serverSecrets = require('./lib/server-secrets');
Raven.config(process.env.SENTRY_DSN || serverSecrets.sentry_dsn).install();
Raven.disableConsoleAlerts();

const { loadServiceClasses } = require('./services');
const { checkErrorResponse } = require('./lib/error-helper');
const analytics = require('./lib/analytics');
const config = require('./lib/server-config');
const GithubConstellation = require('./services/github/github-constellation');
const sysMonitor = require('./lib/sys/monitor');
const log = require('./lib/log');
const { makeMakeBadgeFn } = require('./lib/make-badge');
const { QuickTextMeasurer } = require('./lib/text-measurer');
const suggest = require('./lib/suggest');
const {
  makeColorB,
  makeLabel: getLabel,
  makeBadgeData: getBadgeData,
  setBadgeColor,
} = require('./lib/badge-data');
const {
  makeHandleRequestFn,
  clearRequestCache,
} = require('./lib/request-handler');
const { clearRegularUpdateCache } = require('./lib/regular-update');
const { makeSend } = require('./lib/result-sender');
const { escapeFormat } = require('./lib/path-helpers');

const serverStartTime = new Date((new Date()).toGMTString());

const camp = require('camp').start({
  documentRoot: path.join(__dirname, 'public'),
  port: config.bind.port,
  hostname: config.bind.address,
  secure: config.ssl.isSecure,
  cert: config.ssl.cert,
  key: config.ssl.key,
});

const githubConstellation = new GithubConstellation({
  persistence: config.persistence,
  service: config.services.github,
});
const { apiProvider: githubApiProvider } = githubConstellation;

function reset() {
  clearRequestCache();
  clearRegularUpdateCache();
}

async function stop() {
  await githubConstellation.stop();
  analytics.cancelAutosaving();
  return new Promise(resolve => {
    camp.close(resolve);
  });
}

module.exports = {
  camp,
  reset,
  stop,
};

log(`Server is starting up: ${config.baseUri}`);

let measurer;
try {
  measurer = new QuickTextMeasurer(config.font.path, config.font.fallbackPath);
} catch (e) {
  console.log(`Unable to load fallback font. Using Helvetica-Bold instead.`);
  measurer = new QuickTextMeasurer('Helvetica');
}
const makeBadge = makeMakeBadgeFn(measurer);
const cache = makeHandleRequestFn(makeBadge);

analytics.load();
analytics.scheduleAutosaving();
analytics.setRoutes(camp);

if (serverSecrets && serverSecrets.shieldsSecret) {
  sysMonitor.setRoutes(camp);
}

githubConstellation.initialize(camp);

suggest.setRoutes(config.cors.allowedOrigin, githubApiProvider, camp);

camp.notfound(/\.(svg|png|gif|jpg|json)/, (query, match, end, request) => {
    const format = match[1];
    const badgeData = getBadgeData("404", query);
    badgeData.text[1] = 'badge not found';
    badgeData.colorscheme = 'red';
    // Add format to badge data.
    badgeData.format = format;
    const svg = makeBadge(badgeData);
    makeSend(format, request.res, end)(svg);
});

camp.notfound(/.*/, (query, match, end, request) => {
  end(null, { template: '404.html' });
});

// Vendors.

loadServiceClasses().forEach(
  serviceClass => serviceClass.register(
    { camp, handleRequest: cache, githubApiProvider },
    { handleInternalErrors: config.handleInternalErrors }));

// User defined sources - JSON response
camp.route(/^\/badge\/dynamic\/(json|xml|yaml)\.(svg|png|gif|jpg|json)$/,
cache({
  queryParams: ['uri', 'url', 'query', 'prefix', 'suffix'],
  handler: function(query, match, sendBadge, request) {
    const type = match[1];
    const format = match[2];
    const prefix = query.prefix || '';
    const suffix = query.suffix || '';
    const pathExpression = query.query;
    let requestOptions = {};

    const badgeData = getBadgeData('custom badge', query);

    if (!query.uri && !query.url || !query.query){
      setBadgeColor(badgeData, 'red');
      badgeData.text[1] = !query.query ? 'no query specified' : 'no url specified';
      sendBadge(format, badgeData);
      return;
    }

    let url
    try {
      url = encodeURI(decodeURIComponent(query.url || query.uri));
    } catch(e){
      setBadgeColor(badgeData, 'red');
      badgeData.text[1] = 'malformed url';
      sendBadge(format, badgeData);
      return;
    }

    switch (type) {
      case 'json':
        requestOptions = {
          headers: {
            Accept: 'application/json',
          },
          json: true,
        };
        break;
      case 'xml':
        requestOptions = {
          headers: {
            Accept: 'application/xml, text/xml',
          },
        };
        break;
      case 'yaml':
        requestOptions = {
          headers: {
            Accept: 'text/x-yaml,  text/yaml, application/x-yaml, application/yaml, text/plain',
          },
        };
        break;
    }

    request(url, requestOptions, (err, res, data) => {
      try {
        if (checkErrorResponse(badgeData, err, res, { 404: 'resource not found' })) {
          return;
        }

        badgeData.colorscheme = 'brightgreen';

        let innerText = [];
        switch (type){
          case 'json':
            data = (typeof data === 'object' ? data : JSON.parse(data));
            data = jp.query(data, pathExpression);
            if (!data.length) {
              throw Error('no result');
            }
            innerText = data;
            break;
          case 'xml':
            data = new DOMParser().parseFromString(data);
            data = xpath.select(pathExpression, data);
            if (!data.length) {
              throw Error('no result');
            }
            data.forEach((i,v)=>{
              innerText.push(pathExpression.indexOf('@') + 1 ? i.value : i.firstChild.data);
            });
            break;
          case 'yaml':
            data = yaml.safeLoad(data);
            data = jp.query(data, pathExpression);
            if (!data.length) {
              throw Error('no result');
            }
            innerText = data;
            break;
        }
        badgeData.text[1] = (prefix || '') + innerText.join(', ') + (suffix || '');
      } catch (e) {
        setBadgeColor(badgeData, 'lightgrey');
        badgeData.text[1] = e.message;
      } finally {
        sendBadge(format, badgeData);
      }
    });
  },
}));

// Any badge.
camp.route(/^\/(:|badge\/)(([^-]|--)*?)-?(([^-]|--)*)-(([^-]|--)+)\.(svg|png|gif|jpg)$/,
(data, match, end, ask) => {
  const subject = escapeFormat(match[2]);
  const status = escapeFormat(match[4]);
  const color = escapeFormat(match[6]);
  const format = match[8];

  analytics.noteRequest(data, match);

  // Cache management - the badge is constant.
  const cacheDuration = (3600*24*1)|0;    // 1 day.
  ask.res.setHeader('Cache-Control', 'max-age=' + cacheDuration);
  if (+(new Date(ask.req.headers['if-modified-since'])) >= +serverStartTime) {
    ask.res.statusCode = 304;
    ask.res.end();  // not modified.
    return;
  }
  ask.res.setHeader('Last-Modified', serverStartTime.toGMTString());

  // Badge creation.
  try {
    const badgeData = getBadgeData(subject, data);
    badgeData.text[0] = getLabel(subject, data);
    badgeData.text[1] = status;
    badgeData.colorB = makeColorB(color, data);
    badgeData.template = data.style;
    if (config.profiling.makeBadge) {
      console.time('makeBadge total');
    }
    const svg = makeBadge(badgeData);
    if (config.profiling.makeBadge) {
      console.timeEnd('makeBadge total');
    }
    makeSend(format, ask.res, end)(svg);
  } catch(e) {
    log.error(e.stack);
    const svg = makeBadge({ text: ['error', 'bad badge'], colorscheme: 'red' });
    makeSend(format, ask.res, end)(svg);
  }
});

// Production cache debugging.
let bitFlip = false;
camp.route(/^\/flip\.svg$/, (data, match, end, ask) => {
  const cacheSecs = 60;
  ask.res.setHeader('Cache-Control', 'max-age=' + cacheSecs);
  const reqTime = new Date();
  const date = (new Date(+reqTime + cacheSecs * 1000)).toGMTString();
  ask.res.setHeader('Expires', date);
  const badgeData = getBadgeData('flip', data);
  bitFlip = !bitFlip;
  badgeData.text[1] = bitFlip? 'on': 'off';
  badgeData.colorscheme = bitFlip? 'brightgreen': 'red';
  const svg = makeBadge(badgeData);
  makeSend('svg', ask.res, end)(svg);
});

// Any badge, old version.
camp.route(/^\/([^/]+)\/(.+).png$/,
(data, match, end, ask) => {
  const subject = match[1];
  const status = match[2];
  const color = data.color;

  // Cache management - the badge is constant.
  const cacheDuration = (3600*24*1)|0;    // 1 day.
  ask.res.setHeader('Cache-Control', 'max-age=' + cacheDuration);
  if (+(new Date(ask.req.headers['if-modified-since'])) >= +serverStartTime) {
    ask.res.statusCode = 304;
    ask.res.end();  // not modified.
    return;
  }
  ask.res.setHeader('Last-Modified', serverStartTime.toGMTString());

  // Badge creation.
  try {
    const badgeData = { text: [subject, status] };
    badgeData.colorscheme = color;
    const svg = makeBadge(badgeData);
    makeSend('png', ask.res, end)(svg);
  } catch(e) {
    const svg = makeBadge({ text: ['error', 'bad badge'], colorscheme: 'red' });
    makeSend('png', ask.res, end)(svg);
  }
});

if (config.redirectUri) {
  camp.route(/^\/$/, (data, match, end, ask) => {
    ask.res.statusCode = 302;
    ask.res.setHeader('Location', config.redirectUri);
    ask.res.end();
  });
}

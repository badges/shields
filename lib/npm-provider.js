'use strict';

const { handleRequest: cache } = require('./request-handler');
const { makeBadgeData: getBadgeData } = require('./badge-data');
const { metric } = require('./text-formatters');

// npm downloads count
function mapNpmDownloads(camp, urlComponent, apiUriComponent) {
  camp.route(new RegExp('^/npm/' + urlComponent + '/(.*)\\.(svg|png|gif|jpg|json)$'),
  cache(function(data, match, sendBadge, request) {
    const pkg = encodeURIComponent(match[1]);  // eg, "express" or "@user/express"
    const format = match[2];
    const apiUrl = 'https://api.npmjs.org/downloads/point/' + apiUriComponent + '/' + pkg;
    const badgeData = getBadgeData('downloads', data);
    request(apiUrl, function(err, res, buffer) {
      if (err != null) {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      }
      try {
        const totalDownloads = JSON.parse(buffer).downloads || 0;
        const badgeSuffix = apiUriComponent.replace('last-', '/');
        badgeData.text[1] = metric(totalDownloads) + badgeSuffix;
        if (totalDownloads === 0) {
          badgeData.colorscheme = 'red';
        } else {
          badgeData.colorscheme = 'brightgreen';
        }
        sendBadge(format, badgeData);
      } catch(e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      }
    });
  }));
}

module.exports = {
  mapNpmDownloads
};

'use strict';

const { handleRequest: cache } = require('./request-handler');
const { makeBadgeData: getBadgeData } = require('./badge-data');
const { metric } = require('./text-formatters');

// npm downloads count
function mapNpmDownloads(camp, urlComponent, apiUriComponent) {
  camp.route(new RegExp('^\/npm\/' + urlComponent + '\/(.*)\.(svg|png|gif|jpg|json)$'),
  cache(function(data, match, sendBadge, request) {
    var pkg = encodeURIComponent(match[1]);  // eg, "express" or "@user/express"
    var format = match[2];
    var apiUrl = 'https://api.npmjs.org/downloads/point/' + apiUriComponent + '/' + pkg;
    var badgeData = getBadgeData('downloads', data);
    request(apiUrl, function(err, res, buffer) {
      if (err != null) {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      }
      try {
        var totalDownloads = JSON.parse(buffer).downloads || 0;
        var badgeSuffix = apiUriComponent.replace('last-', '/');
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

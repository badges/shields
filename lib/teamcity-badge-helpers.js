'use strict';

const { makeBadgeData: getBadgeData } = require('./badge-data');

function teamcityBadge(url, buildId, advanced, format, data, sendBadge, request) {
  const apiUrl = url + '/app/rest/builds/buildType:(id:' + buildId + ')?guest=1';
  const badgeData = getBadgeData('build', data);
  request(apiUrl, { headers: { 'Accept': 'application/json' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      const data = JSON.parse(buffer);
      if (advanced)
        badgeData.text[1] = (data.statusText || data.status || '').toLowerCase();
      else
        badgeData.text[1] = (data.status || '').toLowerCase();
      if (data.status === 'SUCCESS') {
        badgeData.colorscheme = 'brightgreen';
        badgeData.text[1] = 'passing';
      } else {
        badgeData.colorscheme = 'red';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}

module.exports = {
  teamcityBadge
};

'use strict';
const moment = require('moment');

const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
  makeLogo: getLogo,
} = require('./badge-data');
const {
  formatDate
} = require('./text-formatters');

const {
  age
} = require('./color-formatters');

// GitHub commits since integration.
function mapGithubCommitsSince({ camp, cache }, githubApiProvider) {
  camp.route(/^\/github\/commits-since\/([^/]+)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
    cache(function (data, match, sendBadge, request) {
      const user = match[1];  // eg, SubtitleEdit
      const repo = match[2];  // eg, subtitleedit
      const version = match[3];  // eg, 3.4.7 or latest
      const format = match[4];
      const badgeData = getBadgeData('commits since ' + version, data);

      function setCommitsSinceBadge(user, repo, version) {
        const apiUrl = `/repos/${user}/${repo}/compare/${version}...master`;
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data);
        }
        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible';
            sendBadge(format, badgeData);
            return;
          }

          try {
            const result = JSON.parse(buffer);
            badgeData.text[1] = result.ahead_by;
            badgeData.colorscheme = 'blue';
            badgeData.text[0] = getLabel('commits since ' + version, data);
            sendBadge(format, badgeData);

          } catch (e) {
            badgeData.text[1] = 'invalid';
            sendBadge(format, badgeData);
          }
        });
      }

      if (version === 'latest') {
        const url = `/repos/${user}/${repo}/releases/latest`;
        githubApiProvider.request(request, url, {}, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible';
            sendBadge(format, badgeData);
            return;
          }
          try {
            const data = JSON.parse(buffer);
            setCommitsSinceBadge(user, repo, data.tag_name);
          } catch (e) {
            badgeData.text[1] = 'invalid';
            sendBadge(format, badgeData);
          }
        });
      } else {
        setCommitsSinceBadge(user, repo, version);
      }
    }));
}

//Github Release & Pre-Release Date Integration release-date-pre (?:\/(all))?
function mapGithubReleaseDate({ camp, cache }, githubApiProvider) {
  camp.route(/^\/github\/(release-date|release-date-pre)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
    cache(function (data, match, sendBadge, request) {
      const releaseType = match[1]; // eg, release-date-pre / release-date
      const user = match[2];  // eg, microsoft
      const repo = match[3];  // eg, vscode
      const format = match[4];
      let apiUrl = `/repos/${user}/${repo}/releases`;
      if(releaseType === 'release-date') {
        apiUrl += '/latest';
      }
      const badgeData = getBadgeData('release date', data);
      if (badgeData.template === 'social') {
        badgeData.logo = getLogo('github', data);
      }
      githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
        if (err != null) {
          badgeData.text[1] = 'inaccessible';
          sendBadge(format, badgeData);
          return;
        }

        //github return 404 if repo not found or no release
        if(res.statusCode === 404) {
          badgeData.text[1] = 'no releases or repo not found';
          sendBadge(format, badgeData);
          return;
        }

        try {
          let data = JSON.parse(buffer);
          if(releaseType === 'release-date-pre') {
            data = data[0];
          }
          const releaseDate = moment(data.created_at);
          badgeData.text[1] = formatDate(releaseDate);
          badgeData.colorscheme = age(releaseDate);
          sendBadge(format, badgeData);
        } catch (e) {
          badgeData.text[1] = 'invalid';
          sendBadge(format, badgeData);
        }
      });
    }));
}


module.exports = {
  mapGithubCommitsSince,
  mapGithubReleaseDate
};

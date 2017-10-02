'use strict';

const { handleRequest: cache } = require('./request-handler');
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
  getLogo
} = require('./badge-data');

// GitHub commits since integration.
function mapGithubCommitsSince(camp, githubApiUrl, githubAuth) {
  camp.route(/^\/github\/commits-since\/([^\/]+)\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
    cache(function (data, match, sendBadge, request) {
      const user = match[1];  // eg, SubtitleEdit
      const repo = match[2];  // eg, subtitleedit
      const version = match[3];  // eg, 3.4.7 or latest
      const format = match[4];
      const badgeData = getBadgeData('commits since ' + version, data);

      function setCommitsSinceBadge(user, repo, version) {
        const apiUrl = githubApiUrl + '/repos/' + user + '/' + repo + '/compare/' + version + '...master';
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data);
        }
        githubAuth.request(request, apiUrl, {}, function (err, res, buffer) {
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
        const url = `https://api.github.com/repos/${user}/${repo}/releases/latest`;
        githubAuth.request(request, url, {}, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible';
            sendBadge(format, badgeData);
            return;
          }
          try {
            const data = JSON.parse(buffer);
            setCommitsSinceBadge(user, repo, data.tag_name);
            return;
          } catch (e) {
            badgeData.text[1] = 'invalid';
            sendBadge(format, badgeData);
            return;
          }
        });
      } else {
        setCommitsSinceBadge(user, repo, version);
      }

    }));
}




module.exports = {
  mapGithubCommitsSince
};
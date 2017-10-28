'use strict';
const moment = require('moment');

const { handleRequest: cache } = require('./request-handler');
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
function mapGithubCommitsSince(camp, githubApiUrl, githubAuth) {
  camp.route(/^\/github\/commits-since\/([^/]+)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
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
function mapGithubReleaseDate(camp, githubApiUrl, githubAuth) {
  camp.route(/^\/github\/(release-date|release-date-pre)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
    cache(function (data, match, sendBadge, request) {
      const releaseType = match[1]; // eg, release-date-pre / release-date
      const user = match[2];  // eg, microsoft
      const repo = match[3];  // eg, vscode
      const format = match[4];
      let apiUrl = `${githubApiUrl}/repos/${user}/${repo}/releases`;
      if(releaseType === 'release-date') {
        apiUrl += '/latest';
      }
      const badgeData = getBadgeData('release date', data);
      if (badgeData.template === 'social') {
        badgeData.logo = getLogo('github', data);
      }
      githubAuth.request(request, apiUrl, {}, function (err, res, buffer) {
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

function mapGithubPRState(camp, githubApiUrl, githubAuth){
  camp.route(/^\/github\/pr-state\/([^/]+)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
  cache((data, match, sendBadge, request) => {
    const [, owner, repo, number, format] = match;
    const apiUrl = `${githubApiUrl}/repos/${owner}/${repo}/pulls/${number}`;
    const badgeData = getBadgeData('pull request', data);

    if (badgeData.template === 'social') {
      badgeData.logo = getLogo('github', data);
    }

    githubAuth.request(request, apiUrl, {}, function (err, res, buffer) {
      if (err != null) {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      }

      //github return 404 if repo not found or no pr
      if(res.statusCode === 404) {
        badgeData.text[1] = 'no pr or repo not found';
        sendBadge(format, badgeData);
        return;
      }

      try {
        const pr = JSON.parse(buffer);
        let colorscheme = '';
        let status = '';

        const responseIsIssueLike = pr.hasOwnProperty('state') &&
          pr.hasOwnProperty('merged') &&
          pr.hasOwnProperty('mergeable') &&
          pr.hasOwnProperty('mergeable_state');

        if(!responseIsIssueLike) {
          badgeData.text[1] = 'inaccessible';
          sendBadge(format, badgeData);
          return;
        }

        if (pr.state === 'closed') {
          badgeData.text[1] = pr.merged ? 'merged' : 'closed';
          badgeData.colorscheme = pr.merged ? 'purple' : 'closed';
          sendBadge(format, badgeData);
          return;
        }

        if(pr.state !== 'open') {
          badgeData.text[1] = 'inaccessible';
          sendBadge(format, badgeData);
          return;
        }

        switch (pr.mergeable_state) {
          case 'clean':
            status = 'mergeable';
            break;
          case 'dirty':
            status = 'has conflicts';
            break;
          case 'behind':
            status = 'needs rebase';
            break;
          default:
            status = pr.mergeable_state;
        }

        switch (pr.mergeable) {
          case null:
            colorscheme = 'lightgrey';
            break;
          case 'unstable':
          case 'behind':
            colorscheme = 'yellow';
            break;
          case true:
            colorscheme = 'green';
            break;
          default:
            colorscheme = 'red';
        }

        badgeData.text[1] = status;
        badgeData.colorscheme = colorscheme;
        sendBadge(format, badgeData);
      } catch (e) {
        console.log(e);
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      }
    });
  }));
}


module.exports = {
  mapGithubCommitsSince,
  mapGithubReleaseDate,
  mapGithubPRState
};

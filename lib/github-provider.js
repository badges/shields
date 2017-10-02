const { handleRequest: cache } = require('./request-handler');
const { makeBadgeData: getBadgeData } = require('./badge-data');
const { metric } = require('./text-formatters');
const githubAuth = require('./github-auth.js');
const serverSecrets = require('./server-secrets');
if (serverSecrets && serverSecrets.gh_client_id) {
    githubAuth.setRoutes(camp);
}

const githubApiUrl = process.env.GITHUB_URL || 'https://api.github.com';

// GitHub commits since integration.
function mapGithubCommitsSince(camp) {
    camp.route(/^\/github\/commits-since\/([^\/]+)\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
        cache(function (data, match, sendBadge, request) {
            var user = match[1];  // eg, SubtitleEdit
            var repo = match[2];  // eg, subtitleedit
            var version = match[3];  // eg, 3.4.7
            var format = match[4];
            var badgeData = getBadgeData('commits since ' + version, data);

            function setCommitsSinceBadge(user, repo, version) {
                var apiUrl = githubApiUrl + '/repos/' + user + '/' + repo + '/compare/' + version + '...master';
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
                        var data = JSON.parse(buffer);
                        badgeData.text[1] = metric(data.ahead_by);
                        badgeData.colorscheme = 'blue';
                        badgeData.text[0] = getLabel('commits since ' + version, data);
                        sendBadge(format, badgeData);
                    } catch (e) {
                        badgeData.text[1] = 'none';
                        sendBadge(format, badgeData);
                    }
                });
            }

            if (version === 'latest') {
                let url = `https://api.github.com/repos/${user}/${repo}/releases/latest`;
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
                        badgeData.text[1] = 'none';
                        sendBadge(format, badgeData);
                        return;
                    }

                });
            }
            else {
                setCommitsSinceBadge(user, repo, version);
            }

        }));
}


module.exports = {
    mapGithubCommitsSince
};
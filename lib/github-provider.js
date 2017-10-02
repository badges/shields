const { handleRequest: cache } = require('./request-handler');
const {
    makeBadgeData: getBadgeData,
    makeLabel: getLabel
} = require('./badge-data');
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
            let user = match[1];  // eg, SubtitleEdit
            let repo = match[2];  // eg, subtitleedit
            let version = match[3];  // eg, 3.4.7 or latest
            let format = match[4];
            let badgeData = getBadgeData('commits since ' + version, data);

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
                        let result = JSON.parse(buffer);
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
            }
            else {
                setCommitsSinceBadge(user, repo, version);
            }

        }));
}




module.exports = {
    mapGithubCommitsSince
};
var githubAuth = require('./github-auth.js');
var githubApiUrl = process.env.GITHUB_URL || 'https://api.github.com';

/**
 * Get the latest review of every reviewer then extract the review states
 * @private
 * @param reviews: array of Github reviews
 * @returns {Array}
 * @example
 *  reviews = [
 *    {reviewer: 'Bob', state: 'CHANGES_REQUESTED'},
 *    {reviewer: 'Henri', state: 'APPROVED'},
 *    {reviewer: 'Bob', state: 'APPROVED'}
 *  ]
 *  returns ['APPROVED', 'APPROVED']
 */
function extractLatestReviewStates(reviews) {
  var lastStateByUser = {};
  // reviews are ordered chronologically, so the last review of each user is the most relevant
  for (var i = 0, l = reviews.length; i < l; i++) {
    lastStateByUser[reviews[i].user.login] = reviews[i].state;
  }
  var lastReviewStates = [];
  for (var user in lastStateByUser) {
    if (lastStateByUser.hasOwnProperty(user)) {
      lastReviewStates.push(lastStateByUser[user]);
    }
  }
  return lastReviewStates;
}

/**
 * Compute the text and color for the pull request review badge
 * @public
 * @param user: Github user name or organization name
 * @param repo: Github repository name
 * @param issue: Github issue ID
 * @param request
 * @param next: callback called once badge name and color are found
 */
function getPrReviewBadgeData(user, repo, issue, request, next) {
  var badgePartialData = {
    text: 'inaccessible',
    colorscheme: 'lightgrey'
  };

  var requestedReviewersUrl = githubApiUrl + '/repos/' + user + '/' + repo + '/pulls/' + issue + '/requested_reviewers';
  githubAuth.request(request, requestedReviewersUrl, {}, function (err, res, buffer) {
    if (err) {
      console.log(err);
      next(badgePartialData);
      return;
    }
    try {
      var pendingReviewers = JSON.parse(buffer);
      if (pendingReviewers.length > 0) {
        // there are still some requested reviewers that did not review the PR yet
        badgePartialData.text = 'pending';
        badgePartialData.colorscheme = 'yellow';
        next(badgePartialData);
      } else { // no pending reviewer
        var reviewsUrl = githubApiUrl + '/repos/' + user + '/' + repo + '/pulls/' + issue + '/reviews';
        githubAuth.request(request, reviewsUrl, {}, function (err, res, buffer) {
          if (err) {
            console.log(err);
            next(badgePartialData);
            return;
          }
          try {
            var reviews = JSON.parse(buffer);
            if (reviews.length === 0) {
              // no requested reviewer and no review done => no review for this pull request
              badgePartialData.text = 'none';
              badgePartialData.colorscheme = 'lightgrey';
            } else {
              var lastestReviewStates = extractLatestReviewStates(reviews);

              // review state values: COMMENT, APPROVED, CHANGES_REQUESTED, DISMISSED
              if (lastestReviewStates.indexOf('CHANGES_REQUESTED') > -1) {
                // there is at least 1 review that requests changes
                badgePartialData.text = 'need changes';
                badgePartialData.colorscheme = 'red';
              } else if (lastestReviewStates.indexOf('APPROVED') > -1) {
                // there is at least 1 review approved, and no review that requests changes
                badgePartialData.text = 'approved';
                badgePartialData.colorscheme = 'green';
              } else {
                // reviews are comments or dismissed
                badgePartialData.text = 'pending';
                badgePartialData.colorscheme = 'yellow';
              }
            }
          } catch (err) {
            console.log(err);
          }
          next(badgePartialData);
        });
      }
    } catch (err) {
      console.log(err);
      next(badgePartialData);
    }
  });
}

/**
 * Compute the text and color for the pull request state badge
 * @public
 * @param user: Github user name or organization name
 * @param repo: Github repository name
 * @param issue: Github issue ID
 * @param request
 * @param next: callback called once badge name and color are found
 */
function getPrStateBadgeData(user, repo, issue, request, next) {
  var badgePartialData = {
    text: 'inaccessible',
    colorscheme: 'lightgrey',
    colorB: null
  };

  var apiUrl = githubApiUrl + '/repos/' + user + '/' + repo + '/pulls/' + issue;
  githubAuth.request(request, apiUrl, {}, function (err, res, buffer) {
    if (err !== null) {
      console.log(err);
      next(badgePartialData);
      return;
    }

    try {
      var pr = JSON.parse(buffer);

      var responseIsIssueLike = pr.hasOwnProperty('state') &&
        pr.hasOwnProperty('merged') &&
        pr.hasOwnProperty('mergeable') &&
        pr.hasOwnProperty('mergeable_state');

      if (responseIsIssueLike) {
        if (pr.state === 'closed') {
          // PR is closed => check if it was merged or not
          if (pr.merged) {
            badgePartialData.text = 'merged';
            badgePartialData.colorscheme = null;
            badgePartialData.colorB = '#6e5494'; // purple-ish color from Github
          } else {
            badgePartialData.text = 'closed';
            badgePartialData.colorscheme = 'red';
          }
        } else if (pr.state === 'open') {
          // 'clean', 'unstable', 'dirty' or 'unknown'
          switch (pr.mergeable_state) {
            case 'clean':
              badgePartialData.text = 'mergeable';
              break;
            case 'dirty':
              badgePartialData.text = 'has conflicts';
              break;
            case 'behind':
              badgePartialData.text = 'need rebase';
              break;
            default:
              badgePartialData.text = pr.mergeable_state;
          }
          if (pr.mergeable === null) {
            badgePartialData.colorscheme = 'lightgrey';
          } else if (pr.mergeable) {
            badgePartialData.colorscheme = (['unstable', 'behind'].indexOf(pr.mergeable_state) > -1) ? 'yellow' : 'green';
          } else { // pr.mergeable === false
            badgePartialData.colorscheme = 'red';
          }
        }
      }
    } catch(err) {
      console.log(err);
    }
    next(badgePartialData);
  });
}

exports.getPrReviewBadgeData = getPrReviewBadgeData;
exports.getPrStateBadgeData = getPrStateBadgeData;

'use strict'

const { BaseJsonService } = require('..')

module.exports = class ScrutinizerBase extends BaseJsonService {
  // https://scrutinizer-ci.com/docs/api/#repository-details
  async fetch({ schema, vcs, user, repo }) {
    return this._requestJson({
      schema,
      url: `https://scrutinizer-ci.com/api/repositories/${vcs}/${user}/${repo}`,
      errorMessages: {
        404: 'project or branch not found',
      },
    })
  }

  transformBranch({ json, branch }) {
    if (!branch) {
      branch = json.default_branch
    }

    return branch
  }
}

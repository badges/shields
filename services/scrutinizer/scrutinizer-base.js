'use strict'

const { BaseJsonService, NotFound } = require('..')

module.exports = class ScrutinizerBase extends BaseJsonService {
  // https://scrutinizer-ci.com/docs/api/#repository-details
  async fetch({ schema, vcs, slug }) {
    return this._requestJson({
      schema,
      url: `https://scrutinizer-ci.com/api/repositories/${vcs}/${slug}`,
      errorMessages: {
        401: 'not authorized to access project',
        404: 'project not found',
      },
    })
  }

  transformBranchInfo({ json, wantedBranch }) {
    if (!wantedBranch) {
      return json.applications[json.default_branch]
    }

    const branch = json.applications[wantedBranch]
    if (!branch) {
      throw new NotFound({ prettyMessage: ' branch not found' })
    }

    return branch
  }

  transformBranchInfoMetricValue({ json, branch, metric }) {
    const {
      index: {
        _embedded: {
          project: { metric_values: metricValues },
        },
      },
    } = this.transformBranchInfo({ json, wantedBranch: branch })

    return { value: metricValues[metric] }
  }
}

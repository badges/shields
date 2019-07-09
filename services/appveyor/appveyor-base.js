'use strict'

const Joi = require('@hapi/joi')
const { nonNegativeInteger } = require('../validators')
const { isBuildStatus } = require('../build-status')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  build: Joi.object({
    status: isBuildStatus,
    jobs: Joi.array()
      .items({
        testsCount: nonNegativeInteger,
        passedTestsCount: nonNegativeInteger,
        failedTestsCount: nonNegativeInteger,
      })
      .required(),
  }),
}).required()

module.exports = class AppVeyorBase extends BaseJsonService {
  static get category() {
    return 'build'
  }

  async fetch({ user, repo, branch }) {
    let url = `https://ci.appveyor.com/api/projects/${user}/${repo}`
    if (branch != null) {
      url += `/branch/${branch}`
    }
    return this._requestJson({
      schema,
      url,
      errorMessages: { 404: 'project not found or access denied' },
    })
  }

  static buildRoute(base) {
    return {
      base,
      pattern: ':user/:repo/:branch*',
    }
  }
}

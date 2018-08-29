'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { nonNegativeInteger } = require('../validators')

const schema = Joi.object({
  build: Joi.object({
    status: Joi.string().required(),
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

  async fetch({ repo, branch }) {
    let url = `https://ci.appveyor.com/api/projects/${repo}`
    if (branch != null) {
      url += `/branch/${branch}`
    }
    return this._requestJson({
      schema,
      url,
      errorMessages: { 404: 'project not found or access denied' },
    })
  }

  static buildUrl(base) {
    return {
      base,
      format: '([^/]+/[^/]+)(?:/(.+))?',
      capture: ['repo', 'branch'],
    }
  }
}

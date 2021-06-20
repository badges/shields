import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { isBuildStatus } from '../build-status.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  build: Joi.object({
    status: isBuildStatus,
    jobs: Joi.array()
      .items({
        name: Joi.string().allow('').required(),
        status: isBuildStatus,
        testsCount: nonNegativeInteger,
        passedTestsCount: nonNegativeInteger,
        failedTestsCount: nonNegativeInteger,
      })
      .required(),
  }),
}).required()

export default class AppVeyorBase extends BaseJsonService {
  static category = 'build'

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

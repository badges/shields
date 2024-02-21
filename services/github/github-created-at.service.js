import { pathParams } from '../index.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation } from './github-helpers.js'

// const schema = Joi.object({
//   // Some repos do not have a license, in which case GitHub returns `{ license: null }`.
//   created_at: Joi.string().required(),
// }).required()

export default class GithubCreatedAt extends GithubAuthV3Service {
  static category = 'activity'
  static route = { base: 'github/created-at', pattern: ':user/:repo' }
  static openApi = {
    '/github/created-at/{user}/{repo}': {
      get: {
        summary: 'GitHub Created At',
        description: documentation,
        parameters: pathParams(
          {
            name: 'user',
            example: 'mashape',
          },
          {
            name: 'repo',
            example: 'apistatus',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'created at' }

  static render({ createdAt }) {
    return {
      message: 'not implemented',
    }
  }

  async handle({ user, repo }) {
    // const { license: licenseObject } = await this._requestJson({
    //   schema,
    //   url: `/repos/${user}/${repo}`,
    //   httpErrors: httpErrorsFor('repo not found'),
    // })

    // const license = licenseObject ? licenseObject.spdx_id : undefined
    return this.constructor.render({ createdAt: '' })
  }
}

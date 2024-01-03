import Joi from 'joi'
import { pathParams } from '../index.js'
import { renderLicenseBadge } from '../licenses.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const schema = Joi.object({
  // Some repos do not have a license, in which case GitHub returns `{ license: null }`.
  license: Joi.object({ spdx_id: Joi.string().required() }).allow(null),
}).required()

export default class GithubLicense extends GithubAuthV3Service {
  static category = 'license'
  static route = { base: 'github/license', pattern: ':user/:repo' }
  static openApi = {
    '/github/license/{user}/{repo}': {
      get: {
        summary: 'GitHub License',
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

  static defaultBadgeData = { label: 'license' }

  static render({ license }) {
    if (license === 'NOASSERTION') {
      return { message: 'not identifiable by github' }
    } else if (license) {
      return renderLicenseBadge({ license })
    } else {
      return { message: 'not specified' }
    }
  }

  async handle({ user, repo }) {
    const { license: licenseObject } = await this._requestJson({
      schema,
      url: `/repos/${user}/${repo}`,
      httpErrors: httpErrorsFor('repo not found'),
    })

    const license = licenseObject ? licenseObject.spdx_id : undefined
    return this.constructor.render({ license })
  }
}

import Joi from 'joi'
import { pathParams } from '../index.js'
import { renderContributorBadge } from '../contributor-count.js'
import { ConditionalGithubAuthV3Service } from './github-auth-service.js'
import { fetchJsonFromRepo } from './github-common-fetch.js'
import { documentation as commonDocumentation } from './github-helpers.js'

const description = `
The All Contributors service allows you to recognize all your project
contributors, including those that don't push code. See
[https://allcontributors.org](https://allcontributors.org)
for more information.

${commonDocumentation}
`

const schema = Joi.object({
  contributors: Joi.array().required(),
}).required()

export default class GithubAllContributorsService extends ConditionalGithubAuthV3Service {
  static category = 'activity'
  static route = {
    base: 'github/all-contributors',
    pattern: ':user/:repo/:branch*',
  }

  static openApi = {
    '/github/all-contributors/{user}/{repo}/{branch}': {
      get: {
        summary: 'GitHub contributors from allcontributors.org (with branch)',
        description,
        parameters: pathParams(
          {
            name: 'user',
            example: 'all-contributors',
          },
          {
            name: 'repo',
            example: 'all-contributors',
          },
          {
            name: 'branch',
            example: 'master',
          },
        ),
      },
    },
    '/github/all-contributors/{user}/{repo}': {
      get: {
        summary: 'GitHub contributors from allcontributors.org',
        description,
        parameters: pathParams(
          {
            name: 'user',
            example: 'all-contributors',
          },
          {
            name: 'repo',
            example: 'all-contributors',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'all contributors' }

  static render({ contributorCount }) {
    return renderContributorBadge({ contributorCount })
  }

  async handle({ user, repo, branch }) {
    const { contributors } = await fetchJsonFromRepo(this, {
      schema,
      user,
      repo,
      branch,
      filename: '.all-contributorsrc',
    })

    const contributorCount = contributors.length
    return this.constructor.render({ contributorCount })
  }
}

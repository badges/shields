import Joi from 'joi'
import { renderContributorBadge } from '../contributor-count.js'
import { ConditionalGithubAuthV3Service } from './github-auth-service.js'
import { fetchJsonFromRepo } from './github-common-fetch.js'
import { documentation } from './github-helpers.js'

const schema = Joi.object({
  contributors: Joi.array().required(),
}).required()

export default class GithubAllContributorsService extends ConditionalGithubAuthV3Service {
  static category = 'activity'
  static route = {
    base: 'github/all-contributors',
    pattern: ':user/:repo/:branch*',
  }

  static examples = [
    {
      title: 'Github All Contributors',
      namedParams: {
        repo: 'all-contributors',
        user: 'all-contributors',
        branch: 'master',
      },
      staticPreview: this.render({ contributorCount: 66 }),
      documentation,
    },
  ]

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

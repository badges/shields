import Joi from 'joi'
import { pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { semver } from '../validators.js'
import { ConditionalGithubAuthV3Service } from './github-auth-service.js'
import { fetchJsonFromRepo } from './github-common-fetch.js'
import { documentation } from './github-helpers.js'

const versionSchema = Joi.object({
  version: Joi.alternatives().try(semver, Joi.equal('independent').required()),
}).required()

export default class GithubLernaJson extends ConditionalGithubAuthV3Service {
  static category = 'version'
  static route = {
    base: 'github/lerna-json/v',
    pattern: ':user/:repo/:branch*',
  }

  static openApi = {
    '/github/lerna-json/v/{user}/{repo}': {
      get: {
        summary: 'GitHub lerna version',
        description: documentation,
        parameters: pathParams(
          {
            name: 'user',
            example: 'babel',
          },
          {
            name: 'repo',
            example: 'babel',
          },
        ),
      },
    },
    '/github/lerna-json/v/{user}/{repo}/{branch}': {
      get: {
        summary: 'GitHub lerna version (branch)',
        description: documentation,
        parameters: pathParams(
          {
            name: 'user',
            example: 'jneander',
          },
          {
            name: 'repo',
            example: 'jneander',
          },
          {
            name: 'branch',
            example: 'colors',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'lerna' }

  static render({ version, branch }) {
    return renderVersionBadge({
      version,
      tag: branch,
      defaultLabel: 'lerna',
    })
  }

  async handle({ user, repo, branch }) {
    const { version } = await fetchJsonFromRepo(this, {
      schema: versionSchema,
      user,
      repo,
      branch,
      filename: 'lerna.json',
    })
    return this.constructor.render({ version, branch })
  }
}

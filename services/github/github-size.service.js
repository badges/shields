import Joi from 'joi'
import prettyBytes from 'pretty-bytes'
import { nonNegativeInteger } from '../validators.js'
import { NotFound } from '../index.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const queryParamSchema = Joi.object({
  branch: Joi.string(),
}).required()

const schema = Joi.alternatives(
  Joi.object({
    size: nonNegativeInteger,
  }).required(),
  Joi.array().required()
)

export default class GithubSize extends GithubAuthV3Service {
  static category = 'size'

  static route = {
    base: 'github/size',
    pattern: ':user/:repo/:path+',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitHub file size in bytes',
      namedParams: {
        user: 'webcaetano',
        repo: 'craft',
        path: 'build/phaser-craft.min.js',
      },
      staticPreview: this.render({ size: 9170 }),
      keywords: ['repo'],
      documentation,
    },
    {
      title: 'GitHub file size in bytes on a specified ref (branch/commit/tag)',
      namedParams: {
        user: 'webcaetano',
        repo: 'craft',
        path: 'build/phaser-craft.min.js',
      },
      staticPreview: this.render({ size: 9170 }),
      keywords: ['repo'],
      documentation,
      queryParams: {
        branch: 'master',
      },
    },
  ]

  static render({ size }) {
    return {
      message: prettyBytes(size),
      color: 'blue',
    }
  }

  async fetch({ user, repo, path, branch }) {
    if (branch) {
      return this._requestJson({
        url: `/repos/${user}/${repo}/contents/${path}?ref=${branch}`,
        schema,
        httpErrors: httpErrorsFor('repo, branch or file not found'),
      })
    } else {
      return this._requestJson({
        url: `/repos/${user}/${repo}/contents/${path}`,
        schema,
        httpErrors: httpErrorsFor('repo or file not found'),
      })
    }
  }

  async handle({ user, repo, path }, queryParams) {
    const branch = queryParams.branch
    const body = await this.fetch({ user, repo, path, branch })
    if (Array.isArray(body)) {
      throw new NotFound({ prettyMessage: 'not a regular file' })
    }
    return this.constructor.render({ size: body.size })
  }
}

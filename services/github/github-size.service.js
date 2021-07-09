import Joi from 'joi'
import prettyBytes from 'pretty-bytes'
import { nonNegativeInteger } from '../validators.js'
import { NotFound } from '../index.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, errorMessagesFor } from './github-helpers.js'

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
    pattern: ':user/:repo/:path*',
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
  ]

  static render({ size }) {
    return {
      message: prettyBytes(size),
      color: 'blue',
    }
  }

  async fetch({ user, repo, path }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/contents/${path}`,
      schema,
      errorMessages: errorMessagesFor('repo or file not found'),
    })
  }

  async handle({ user, repo, path }) {
    const body = await this.fetch({ user, repo, path })
    if (Array.isArray(body)) {
      throw new NotFound({ prettyMessage: 'not a regular file' })
    }
    return this.constructor.render({ size: body.size })
  }
}

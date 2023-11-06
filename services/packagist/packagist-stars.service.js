import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger, optionalUrl } from '../validators.js'
import { pathParam, queryParam } from '../index.js'
import {
  BasePackagistService,
  customServerDocumentationFragment,
  cacheDocumentationFragment,
  description,
} from './packagist-base.js'

const schema = Joi.object({
  package: Joi.object({
    favers: nonNegativeInteger,
  }).required(),
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

export default class PackagistStars extends BasePackagistService {
  static category = 'rating'

  static route = {
    base: 'packagist/stars',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static openApi = {
    '/packagist/stars/{user}/{repo}': {
      get: {
        summary: 'Packagist Stars',
        description: description + cacheDocumentationFragment,
        parameters: [
          pathParam({
            name: 'user',
            example: 'guzzlehttp',
          }),
          pathParam({
            name: 'repo',
            example: 'guzzle',
          }),
          queryParam({
            name: 'server',
            description: customServerDocumentationFragment,
            example: 'https://packagist.org',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'stars',
  }

  static render({ stars }) {
    return {
      message: metric(stars),
      color: 'brightgreen',
    }
  }

  async handle({ user, repo }, { server }) {
    const {
      package: { favers },
    } = await this.fetchByJsonAPI({ user, repo, schema, server })

    return this.constructor.render({
      stars: favers,
    })
  }
}

'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { optionalUrl } = require('../validators')
const {
  keywords,
  BasePackagistService,
  customServerDocumentationFragment,
  cacheDocumentationFragment,
} = require('./packagist-base')

const schema = Joi.object({
  package: Joi.object({
    favers: nonNegativeInteger,
  }).required(),
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

module.exports = class PackagistStars extends BasePackagistService {
  static category = 'rating'

  static route = {
    base: 'packagist/stars',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Packagist Stars',
      namedParams: {
        user: 'guzzlehttp',
        repo: 'guzzle',
      },
      staticPreview: this.render({
        stars: 1000,
      }),
      keywords,
      documentation: cacheDocumentationFragment,
    },
    {
      title: 'Packagist Stars (custom server)',
      namedParams: {
        user: 'guzzlehttp',
        repo: 'guzzle',
      },
      staticPreview: this.render({
        stars: 1000,
      }),
      queryParams: { server: 'https://packagist.org' },
      keywords,
      documentation:
        customServerDocumentationFragment + cacheDocumentationFragment,
    },
  ]

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

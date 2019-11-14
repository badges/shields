'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { downloadCount } = require('../color-formatters')
const { optionalUrl } = require('../validators')
const {
  keywords,
  BasePackagistService,
  customServerDocumentationFragment,
  cacheDocumentationFragment,
} = require('./packagist-base')

const periodMap = {
  dm: {
    field: 'monthly',
    suffix: '/month',
  },
  dd: {
    field: 'daily',
    suffix: '/day',
  },
  dt: {
    field: 'total',
    suffix: '',
  },
}

const schema = Joi.object({
  package: Joi.object({
    downloads: Joi.object({
      total: Joi.number().required(),
      monthly: Joi.number().required(),
      daily: Joi.number().required(),
    }).required(),
  }).required(),
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

module.exports = class PackagistDownloads extends BasePackagistService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'packagist',
      pattern: ':interval(dm|dd|dt)/:user/:repo',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Packagist',
        namedParams: {
          interval: 'dm',
          user: 'doctrine',
          repo: 'orm',
        },
        staticPreview: this.render({
          downloads: 1000000,
          interval: 'dm',
        }),
        keywords,
        documentation: cacheDocumentationFragment,
      },
      {
        title: 'Packagist (custom server)',
        namedParams: {
          interval: 'dm',
          user: 'doctrine',
          repo: 'orm',
        },
        staticPreview: this.render({
          downloads: 1000000,
          interval: 'dm',
        }),
        queryParams: { server: 'https://packagist.org' },
        keywords,
        documentation:
          customServerDocumentationFragment + cacheDocumentationFragment,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'downloads',
    }
  }

  static render({ downloads, interval }) {
    return {
      message: metric(downloads) + periodMap[interval].suffix,
      color: downloadCount(downloads),
    }
  }

  async handle({ interval, user, repo }, { server }) {
    const {
      package: { downloads },
    } = await this.fetchByJsonAPI({ user, repo, schema, server })

    return this.constructor.render({
      downloads: downloads[periodMap[interval].field],
      interval,
    })
  }
}

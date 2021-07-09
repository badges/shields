import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { downloadCount } from '../color-formatters.js'
import { optionalUrl } from '../validators.js'
import {
  keywords,
  BasePackagistService,
  customServerDocumentationFragment,
  cacheDocumentationFragment,
} from './packagist-base.js'

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

export default class PackagistDownloads extends BasePackagistService {
  static category = 'downloads'

  static route = {
    base: 'packagist',
    pattern: ':interval(dm|dd|dt)/:user/:repo',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Packagist Downloads',
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
      title: 'Packagist Downloads (custom server)',
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

  static defaultBadgeData = {
    label: 'downloads',
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

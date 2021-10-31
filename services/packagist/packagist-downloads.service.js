import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
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
    interval: 'month',
  },
  dd: {
    field: 'daily',
    interval: 'day',
  },
  dt: {
    field: 'total',
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
      staticPreview: renderDownloadsBadge({
        downloads: 1000000,
        interval: 'month',
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
      staticPreview: renderDownloadsBadge({
        downloads: 1000000,
        interval: 'month',
      }),
      queryParams: { server: 'https://packagist.org' },
      keywords,
      documentation:
        customServerDocumentationFragment + cacheDocumentationFragment,
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  async handle({ interval: period, user, repo }, { server }) {
    const {
      package: { downloads },
    } = await this.fetchByJsonAPI({
      user,
      repo,
      schema,
      server,
    })
    const { interval, field } = periodMap[period]
    return renderDownloadsBadge({
      downloads: downloads[field],
      interval,
    })
  }
}

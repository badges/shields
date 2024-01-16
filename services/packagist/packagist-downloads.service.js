import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { optionalUrl } from '../validators.js'
import { pathParam, queryParam } from '../index.js'
import {
  BasePackagistService,
  customServerDocumentationFragment,
  cacheDocumentationFragment,
  description,
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
    pattern: ':interval(dd|dm|dt)/:user/:repo',
    queryParamSchema,
  }

  static openApi = {
    '/packagist/{interval}/{user}/{repo}': {
      get: {
        summary: 'Packagist Downloads',
        description: description + cacheDocumentationFragment,
        parameters: [
          pathParam({
            name: 'interval',
            example: 'dm',
            schema: { type: 'string', enum: this.getEnum('interval') },
            description: 'Daily, Monthly, or Total downloads',
          }),
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

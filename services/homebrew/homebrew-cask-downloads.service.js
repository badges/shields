import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { BaseJsonService, pathParams } from '../index.js'
import { nonNegativeInteger } from '../validators.js'

function getSchema({ cask }) {
  return Joi.object({
    analytics: Joi.object({
      install: Joi.object({
        '30d': Joi.object({ [cask]: nonNegativeInteger }).required(),
        '90d': Joi.object({ [cask]: nonNegativeInteger }).required(),
        '365d': Joi.object({ [cask]: nonNegativeInteger }).required(),
      }).required(),
    }).required(),
  }).required()
}

const periodMap = {
  dm: {
    api_field: '30d',
    interval: 'month',
  },
  dq: {
    api_field: '90d',
    interval: 'quarter',
  },
  dy: {
    api_field: '365d',
    interval: 'year',
  },
}

export default class HomebrewCaskDownloads extends BaseJsonService {
  static category = 'downloads'

  static route = {
    base: 'homebrew/cask/installs',
    pattern: ':interval(dm|dq|dy)/:cask',
  }

  static openApi = {
    '/homebrew/cask/installs/{interval}/{cask}': {
      get: {
        summary: 'Homebrew Cask Downloads',
        parameters: pathParams(
          {
            name: 'interval',
            example: 'dm',
            schema: { type: 'string', enum: this.getEnum('interval') },
            description: 'Monthly, Quarterly or Yearly downloads',
          },
          {
            name: 'cask',
            example: 'freetube',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  async fetch({ cask }) {
    const schema = getSchema({ cask })
    return this._requestJson({
      schema,
      url: `https://formulae.brew.sh/api/cask/${cask}.json`,
      httpErrors: { 404: 'cask not found' },
    })
  }

  async handle({ interval, cask }) {
    const {
      analytics: { install },
    } = await this.fetch({ cask })

    return renderDownloadsBadge({
      downloads: install[periodMap[interval].api_field][cask],
      interval: periodMap[interval].interval,
    })
  }
}

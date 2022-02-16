import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { BaseJsonService } from '../index.js'
import { nonNegativeInteger } from '../validators.js'

function getSchema({ formula }) {
  return Joi.object({
    analytics: Joi.object({
      install: Joi.object({
        '30d': Joi.object({ [formula]: nonNegativeInteger }).required(),
        '90d': Joi.object({ [formula]: nonNegativeInteger }).required(),
        '365d': Joi.object({ [formula]: nonNegativeInteger }).required(),
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

export default class HomebrewDownloads extends BaseJsonService {
  static category = 'downloads'

  static route = {
    base: 'homebrew',
    pattern: 'installs/:interval(dm|dq|dy)/:formula',
  }

  static examples = [
    {
      title: 'homebrew downloads',
      namedParams: { interval: 'dm', formula: 'cake' },
      staticPreview: renderDownloadsBadge({ interval: 'month', downloads: 93 }),
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  async fetch({ formula }) {
    const schema = getSchema({ formula })
    return this._requestJson({
      schema,
      url: `https://formulae.brew.sh/api/formula/${formula}.json`,
      errorMessages: { 404: 'formula not found' },
    })
  }

  async handle({ interval, formula }) {
    const {
      analytics: { install },
    } = await this.fetch({ formula })
    return renderDownloadsBadge({
      downloads: install[periodMap[interval].api_field][formula],
      interval: periodMap[interval].interval,
    })
  }
}

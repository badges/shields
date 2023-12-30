import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({
  installs: Joi.object({
    total: nonNegativeInteger,
    daily: Joi.object({
      data: Joi.array()
        .items(
          Joi.object({
            totals: Joi.array().items(nonNegativeInteger).required(),
          }).required(),
        )
        .required(),
    }).required(),
  }).required(),
})

const intervalMap = {
  dd: {
    label: 'day',
    transform: resp => {
      const platforms = resp.installs.daily.data
      let downloads = 0
      platforms.forEach(platform => {
        // use the downloads from yesterday
        downloads += platform.totals[1]
      })
      return downloads
    },
  },
  dw: {
    label: 'week',
    transform: resp => {
      const platforms = resp.installs.daily.data
      let downloads = 0
      platforms.forEach(platform => {
        // total for the first 7 days
        for (let i = 0; i < 7; i++) {
          downloads += platform.totals[i]
        }
      })
      return downloads
    },
  },
  dm: {
    label: 'month',
    transform: resp => {
      const platforms = resp.installs.daily.data
      let downloads = 0
      platforms.forEach(platform => {
        // total for the first 30 days
        for (let i = 0; i < 30; i++) {
          downloads += platform.totals[i]
        }
      })
      return downloads
    },
  },
  dt: {
    transform: resp => resp.installs.total,
  },
}

export default class PackageControlDownloads extends BaseJsonService {
  static category = 'downloads'

  static route = {
    base: 'packagecontrol',
    pattern: ':interval(dd|dw|dm|dt)/:packageName',
  }

  static openApi = {
    '/packagecontrol/{interval}/{packageName}': {
      get: {
        summary: 'Package Control Downloads',
        description:
          'Package Control is a package registry for Sublime Text packages',
        parameters: pathParams(
          {
            name: 'interval',
            example: 'dt',
            schema: { type: 'string', enum: this.getEnum('interval') },
            description: 'Daily, Weekly, Monthly, or Total downloads',
          },
          { name: 'packageName', example: 'GitGutter' },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  async fetch({ packageName }) {
    const url = `https://packagecontrol.io/packages/${packageName}.json`
    return this._requestJson({ schema, url })
  }

  async handle({ interval, packageName }) {
    const data = await this.fetch({ packageName })
    return renderDownloadsBadge({
      downloads: intervalMap[interval].transform(data),
      interval: intervalMap[interval].label,
    })
  }
}

import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { downloadCount } from '../color-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const keywords = ['sublime', 'sublimetext', 'packagecontrol']

const schema = Joi.object({
  installs: Joi.object({
    total: nonNegativeInteger,
    daily: Joi.object({
      data: Joi.array()
        .items(
          Joi.object({
            totals: Joi.array().items(nonNegativeInteger).required(),
          }).required()
        )
        .required(),
    }).required(),
  }).required(),
})

function DownloadsForInterval(interval) {
  const { base, messageSuffix, transform, name } = {
    day: {
      base: 'packagecontrol/dd',
      messageSuffix: '/day',
      transform: resp => {
        const platforms = resp.installs.daily.data
        let downloads = 0
        platforms.forEach(platform => {
          // use the downloads from yesterday
          downloads += platform.totals[1]
        })
        return downloads
      },
      name: 'PackageControlDownloadsDay',
    },
    week: {
      base: 'packagecontrol/dw',
      messageSuffix: '/week',
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
      name: 'PackageControlDownloadsWeek',
    },
    month: {
      base: 'packagecontrol/dm',
      messageSuffix: '/month',
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
      name: 'PackageControlDownloadsMonth',
    },
    total: {
      base: 'packagecontrol/dt',
      messageSuffix: '',
      transform: resp => resp.installs.total,
      name: 'PackageControlDownloadsTotal',
    },
  }[interval]

  return class PackageControlDownloads extends BaseJsonService {
    static name = name

    static category = 'downloads'

    static route = { base, pattern: ':packageName' }

    static examples = [
      {
        title: 'Package Control',
        namedParams: { packageName: 'GitGutter' },
        staticPreview: this.render({ downloads: 12000 }),
        keywords,
      },
    ]

    static defaultBadgeData = { label: 'downloads' }

    static render({ downloads }) {
      return {
        message: `${metric(downloads)}${messageSuffix}`,
        color: downloadCount(downloads),
      }
    }

    async fetch({ packageName }) {
      const url = `https://packagecontrol.io/packages/${packageName}.json`
      return this._requestJson({ schema, url })
    }

    async handle({ packageName }) {
      const data = await this.fetch({ packageName })
      return this.constructor.render({ downloads: transform(data) })
    }
  }
}

export default ['day', 'week', 'month', 'total'].map(DownloadsForInterval)
